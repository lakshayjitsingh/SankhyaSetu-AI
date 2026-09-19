import os
import json
import logging
from contextlib import contextmanager
from werkzeug.security import generate_password_hash, check_password_hash

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

logger = logging.getLogger("sankhyasetu.db")

def resolve_database_url():
    url = os.environ.get("DATABASE_URL", "")
    if not url:
        for p in [os.path.join(os.path.dirname(__file__), ".env"), os.path.join(os.path.dirname(__file__), "..", ".env")]:
            if os.path.exists(p):
                try:
                    with open(p, "r", encoding="utf-8-sig") as f:
                        for line in f:
                            if line.strip().startswith("DATABASE_URL="):
                                url = line.split("DATABASE_URL=", 1)[1].strip().strip('"').strip("'")
                                break
                    if url:
                        break
                except Exception:
                    pass
    return url

DATABASE_URL = resolve_database_url()

# Lazy-loaded connection pool
_POOL = None

def get_connection_pool():
    global _POOL
    if _POOL is not None:
        return _POOL
    
    db_url = resolve_database_url()
    if not db_url:
        logger.warning("DATABASE_URL not set in environment. Running in offline/mock database mode.")
        return None
        
    try:
        import psycopg2.pool
        # Neon PostgreSQL pooled connection
        _POOL = psycopg2.pool.SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=db_url,
            sslmode="require"
        )
        logger.info("Neon PostgreSQL connection pool initialized successfully.")
        return _POOL
    except Exception as e:
        logger.error(f"Failed to initialize Neon PostgreSQL connection pool: {e}")
        return None


@contextmanager
def get_db_cursor(commit=False):
    pool = get_connection_pool()
    if pool is None:
        yield None
        return

    conn = None
    try:
        conn = pool.getconn()
        with conn.cursor() as cur:
            yield cur
        if commit:
            conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error during transaction: {e}")
        raise e
    finally:
        if conn and pool:
            pool.putconn(conn)


def is_connected():
    try:
        with get_db_cursor() as cur:
            if cur is None:
                return False
            cur.execute("SELECT 1;")
            row = cur.fetchone()
            return bool(row and row[0] == 1)
    except Exception:
        return False


def init_db():
    """Initializes schema and tables in Neon PostgreSQL with zero-downtime IF NOT EXISTS."""
    logger.info("Verifying and initializing Neon database tables...")
    try:
        with get_db_cursor(commit=True) as cur:
            if cur is None:
                logger.warning("Database unavailable, skipping table creation.")
                return False

            # 1. Officers Table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS officers (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    role_id VARCHAR(100) NOT NULL,
                    role_name VARCHAR(255),
                    department VARCHAR(255),
                    auth_provider VARCHAR(50) DEFAULT 'manual',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # 2. Assessment Attempts Table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS assessment_attempts (
                    id SERIAL PRIMARY KEY,
                    officer_email VARCHAR(255) NOT NULL,
                    role_id VARCHAR(100) NOT NULL,
                    score_achieved INT NOT NULL,
                    passed BOOLEAN NOT NULL,
                    radar_scores JSONB NOT NULL,
                    detailed_answers JSONB,
                    attempt_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # 3. Create Performance Indexes
            cur.execute("""
                CREATE INDEX IF NOT EXISTS idx_assessment_officer_email 
                ON assessment_attempts(officer_email);
            """)
            cur.execute("""
                CREATE INDEX IF NOT EXISTS idx_assessment_timestamp 
                ON assessment_attempts(attempt_timestamp DESC);
            """)
            # Ensure password column exists with zero downtime
            cur.execute("""
                ALTER TABLE officers ADD COLUMN IF NOT EXISTS password VARCHAR(255);
            """)

            # Pre-seed standard accounts into Neon if not already present
            seed_accounts = [
                ("lakshayjit.singh2006@gmail.com", "Lakshayjit Singh", "field_investigator_nsso", "Field Investigator (NSSO)", "Field Operations Division", "manual", "password123"),
                ("officer.iss@nic.in", "Senior ISS Officer", "statistical_officer_cso", "Junior Statistical Officer (CSO)", "National Accounts Division", "manual", "admin123"),
                ("supervisor.asuse@nic.in", "ASUSE Field Supervisor", "survey_supervisor_asuse", "Survey Supervisor (ASUSE)", "Economic Census Division", "manual", "supervisor123"),
                ("lakshayjitsingh96@gmail.com", "Lakshayjit Singh", "field_investigator_nsso", "Field Investigator (NSSO)", "Field Operations Division", "google", "GOOGLE_OAUTH_VERIFIED")
            ]
            for sa in seed_accounts:
                cur.execute("""
                    INSERT INTO officers (email, name, role_id, role_name, department, auth_provider, password, last_active)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (email) 
                    DO UPDATE SET 
                        password = COALESCE(officers.password, EXCLUDED.password),
                        name = COALESCE(officers.name, EXCLUDED.name);
                """, sa)

            logger.info("Neon database tables and seed accounts verified successfully.")
            return True
    except Exception as e:
        logger.error(f"Error during init_db: {e}")
        return False


def upsert_officer(email, name, role_id, role_name=None, department=None, auth_provider="manual", password=None):
    """Inserts or updates an officer in the database using parameterized queries and secure hashing."""
    if not email:
        return None

    email = email.strip().lower()
    name = name.strip() if name else email.split("@")[0]

    # If password is provided and not already a cryptographic hash, hash it securely
    hashed_password = password
    if password and not password.startswith(("scrypt:", "pbkdf2:", "bcrypt:", "GOOGLE_")):
        hashed_password = generate_password_hash(password)

    try:
        with get_db_cursor(commit=True) as cur:
            if cur is None:
                return None

            # If manual account and no password provided (e.g. background session sync),
            # DO NOT create a new ghost officer if deleted from Neon. Only update existing.
            if auth_provider == "manual" and not hashed_password:
                cur.execute("SELECT id FROM officers WHERE email = %s;", (email,))
                if not cur.fetchone():
                    return {"not_found": True}
                
                cur.execute("""
                    UPDATE officers SET
                        name = COALESCE(%s, name),
                        role_id = COALESCE(%s, role_id),
                        role_name = COALESCE(%s, role_name),
                        department = COALESCE(%s, department),
                        last_active = CURRENT_TIMESTAMP
                    WHERE email = %s
                    RETURNING id, email, name, role_id, role_name, department, auth_provider, created_at, last_active;
                """, (name, role_id, role_name, department, email))
                row = cur.fetchone()
                if row:
                    return {
                        "id": row[0],
                        "email": row[1],
                        "name": row[2],
                        "role_id": row[3],
                        "role_name": row[4],
                        "department": row[5],
                        "auth_provider": row[6],
                        "created_at": row[7].isoformat() if row[7] else None,
                        "last_active": row[8].isoformat() if row[8] else None
                    }
                return None

            cur.execute("""
                INSERT INTO officers (email, name, role_id, role_name, department, auth_provider, password, last_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (email) 
                DO UPDATE SET 
                    name = EXCLUDED.name,
                    role_id = EXCLUDED.role_id,
                    role_name = COALESCE(EXCLUDED.role_name, officers.role_name),
                    department = COALESCE(EXCLUDED.department, officers.department),
                    auth_provider = COALESCE(EXCLUDED.auth_provider, officers.auth_provider),
                    password = COALESCE(EXCLUDED.password, officers.password),
                    last_active = CURRENT_TIMESTAMP
                RETURNING id, email, name, role_id, role_name, department, auth_provider, created_at, last_active;
            """, (email, name, role_id, role_name, department, auth_provider, hashed_password))
            
            row = cur.fetchone()
            if row:
                return {
                    "id": row[0],
                    "email": row[1],
                    "name": row[2],
                    "role_id": row[3],
                    "role_name": row[4],
                    "department": row[5],
                    "auth_provider": row[6],
                    "created_at": row[7].isoformat() if row[7] else None,
                    "last_active": row[8].isoformat() if row[8] else None
                }
    except Exception as e:
        logger.error(f"Error upserting officer {email}: {e}")
    return None


def register_officer(email, password, name, role_id="field_investigator_nsso", role_name=None, department=None):
    """Registers a new officer directly in Neon Cloud PostgreSQL with cryptographic salted scrypt hashing."""
    if not email or not password:
        return {"success": False, "error": "Email and password are required"}

    email = email.strip().lower()
    password = password.strip()
    name = name.strip() if name else email.split("@")[0]

    try:
        with get_db_cursor(commit=True) as cur:
            if cur is None:
                return {"success": False, "error": "Database unavailable"}

            # Check if user already exists
            cur.execute("SELECT id FROM officers WHERE email = %s;", (email,))
            if cur.fetchone():
                return {"success": False, "error": "An account with this email is already registered. Please Sign In."}

            # Cryptographically hash password using salted scrypt
            hashed_password = generate_password_hash(password)

            cur.execute("""
                INSERT INTO officers (email, name, role_id, role_name, department, auth_provider, password, last_active)
                VALUES (%s, %s, %s, %s, %s, 'manual', %s, CURRENT_TIMESTAMP)
                RETURNING id, email, name, role_id, role_name, department, auth_provider, created_at, last_active;
            """, (email, name, role_id, role_name or "Field Investigator (NSSO)", department or "Field Operations Division", hashed_password))

            row = cur.fetchone()
            if row:
                return {
                    "success": True,
                    "officer": {
                        "id": row[0],
                        "email": row[1],
                        "name": row[2],
                        "role_id": row[3],
                        "role_name": row[4],
                        "department": row[5],
                        "auth_provider": row[6],
                        "created_at": row[7].isoformat() if row[7] else None,
                        "last_active": row[8].isoformat() if row[8] else None
                    }
                }
    except Exception as e:
        logger.error(f"Error registering officer {email}: {e}")
        return {"success": False, "error": str(e)}
    return {"success": False, "error": "Registration failed"}


def verify_officer_login(email, password):
    """Authenticates an officer's credentials against Neon Cloud PostgreSQL using secure hash checking and auto-upgrade."""
    if not email or not password:
        return {"success": False, "error": "Email and password are required"}

    email = email.strip().lower()
    password = password.strip()

    try:
        with get_db_cursor(commit=True) as cur:
            if cur is None:
                return {"success": False, "error": "Database unavailable"}

            cur.execute("""
                SELECT id, email, name, role_id, role_name, department, auth_provider, password, created_at, last_active
                FROM officers
                WHERE email = %s;
            """, (email,))

            row = cur.fetchone()
            if not row:
                return {"success": False, "error": "No account found with this email. Please Sign Up first."}

            auth_prov = row[6]
            db_password = row[7]
            is_valid = False
            needs_hash_upgrade = False

            if not db_password:
                if auth_prov == "google":
                    return {"success": False, "error": "This account is registered via Google Sign-In. Please click 'Continue with Google'."}
                return {"success": False, "error": "No password set for this account. Please Sign Up first."}
            elif db_password.startswith(("scrypt:", "pbkdf2:", "bcrypt:")):
                is_valid = check_password_hash(db_password, password)
            else:
                # Legacy plain-text password match (e.g. initial demo seed)
                if db_password == password:
                    is_valid = True
                    needs_hash_upgrade = True

            if not is_valid:
                return {"success": False, "error": "Incorrect password. Please try again."}

            # If legacy plain text matched, seamlessly upgrade in Neon to modern scrypt hash
            if needs_hash_upgrade:
                new_hash = generate_password_hash(password)
                cur.execute("UPDATE officers SET password = %s, last_active = CURRENT_TIMESTAMP WHERE email = %s;", (new_hash, email))
            else:
                cur.execute("UPDATE officers SET last_active = CURRENT_TIMESTAMP WHERE email = %s;", (email,))

            return {
                "success": True,
                "officer": {
                    "id": row[0],
                    "email": row[1],
                    "name": row[2],
                    "role_id": row[3],
                    "role_name": row[4],
                    "department": row[5],
                    "auth_provider": row[6],
                    "created_at": row[8].isoformat() if row[8] else None,
                    "last_active": row[9].isoformat() if row[9] else None
                }
            }
    except Exception as e:
        logger.error(f"Error verifying login for {email}: {e}")
        return {"success": False, "error": str(e)}
    return {"success": False, "error": "Login verification failed"}


def change_officer_password(email, current_password, new_password):
    """Securely updates an officer's password in Neon Cloud PostgreSQL.
    Strictly blocks Google OAuth accounts and validates current password before saving new scrypt hash."""
    if not email or not current_password or not new_password:
        return {"success": False, "error": "Email, current password, and new password are required."}

    email = email.strip().lower()
    current_password = current_password.strip()
    new_password = new_password.strip()

    if len(new_password) < 6:
        return {"success": False, "error": "New password must be at least 6 characters."}

    if current_password == new_password:
        return {"success": False, "error": "New password must be different from current password."}

    try:
        with get_db_cursor(commit=True) as cur:
            if cur is None:
                return {"success": False, "error": "Database unavailable."}

            cur.execute("""
                SELECT id, email, auth_provider, password
                FROM officers
                WHERE email = %s;
            """, (email,))

            row = cur.fetchone()
            if not row:
                return {"success": False, "error": "Officer account not found."}

            auth_provider = row[2]
            db_password = row[3]

            # Google OAuth accounts cannot change password locally
            if auth_provider == "google" or db_password == "GOOGLE_OAUTH_VERIFIED":
                return {
                    "success": False, 
                    "error": "This account is signed in with Google OAuth. Password changes must be made via your Google Account."
                }

            # Verify current password
            is_valid = False
            if not db_password:
                is_valid = False
            elif db_password.startswith(("scrypt:", "pbkdf2:", "bcrypt:")):
                is_valid = check_password_hash(db_password, current_password)
            else:
                is_valid = (db_password == current_password)

            if not is_valid:
                return {"success": False, "error": "Current password is incorrect. Please verify and try again."}

            # Hash new password with salted scrypt and update in Neon
            new_hash = generate_password_hash(new_password)
            cur.execute("""
                UPDATE officers 
                SET password = %s, last_active = CURRENT_TIMESTAMP 
                WHERE email = %s;
            """, (new_hash, email))

            logger.info(f"Password changed successfully for officer {email}")
            return {
                "success": True, 
                "message": "Password updated successfully."
            }
    except Exception as e:
        logger.error(f"Error changing password for {email}: {e}")
        return {"success": False, "error": str(e)}


def save_assessment_attempt(officer_email, role_id, score_achieved, passed, radar_scores, detailed_answers=None):
    """Saves a completed assessment attempt and 5-axis FRAC radar score to Neon."""
    if not officer_email:
        return None

    officer_email = officer_email.strip().lower()
    radar_json = json.dumps(radar_scores or {})
    answers_json = json.dumps(detailed_answers or [])

    try:
        with get_db_cursor(commit=True) as cur:
            if cur is None:
                return None

            cur.execute("""
                INSERT INTO assessment_attempts (
                    officer_email, role_id, score_achieved, passed, radar_scores, detailed_answers, attempt_timestamp
                )
                VALUES (%s, %s, %s, %s, %s::jsonb, %s::jsonb, CURRENT_TIMESTAMP)
                RETURNING id, officer_email, role_id, score_achieved, passed, radar_scores, attempt_timestamp;
            """, (officer_email, role_id, int(score_achieved), bool(passed), radar_json, answers_json))

            row = cur.fetchone()
            if row:
                return {
                    "id": row[0],
                    "officer_email": row[1],
                    "role_id": row[2],
                    "score_achieved": row[3],
                    "passed": row[4],
                    "radar_scores": row[5],
                    "attempt_timestamp": row[6].isoformat() if row[6] else None
                }
    except Exception as e:
        logger.error(f"Error saving attempt for {officer_email}: {e}")
    return None


def get_officer_history(officer_email):
    """Retrieves all past assessment attempts and competency scores for an officer."""
    if not officer_email:
        return []

    officer_email = officer_email.strip().lower()

    try:
        with get_db_cursor() as cur:
            if cur is None:
                return []

            cur.execute("""
                SELECT id, role_id, score_achieved, passed, radar_scores, detailed_answers, attempt_timestamp
                FROM assessment_attempts
                WHERE officer_email = %s
                ORDER BY attempt_timestamp ASC;
            """, (officer_email,))

            rows = cur.fetchall()
            history = []
            for row in rows:
                history.append({
                    "id": row[0],
                    "role_id": row[1],
                    "score": row[2],
                    "score_achieved": row[2],
                    "passed": row[3],
                    "radar_scores": row[4],
                    "competencies": row[4],
                    "detailed_answers": row[5],
                    "date": row[6].strftime("%d %b %Y, %I:%M %p") if row[6] else "Recent",
                    "timestamp": row[6].isoformat() if row[6] else None
                })
            return history
    except Exception as e:
        logger.error(f"Error retrieving history for {officer_email}: {e}")
    return []


def get_all_officers_stats():
    """Aggregates nationwide cadre statistics for the MoSPI Leadership Heatmap."""
    try:
        with get_db_cursor() as cur:
            if cur is None:
                return None

            cur.execute("SELECT COUNT(DISTINCT email) FROM officers;")
            total_officers = cur.fetchone()[0]

            cur.execute("SELECT COUNT(*), AVG(score_achieved) FROM assessment_attempts;")
            attempt_row = cur.fetchone()
            total_attempts = attempt_row[0]
            avg_score = float(attempt_row[1]) if attempt_row[1] is not None else 0.0

            return {
                "total_officers": total_officers,
                "total_attempts": total_attempts,
                "national_avg_score": round(avg_score, 1)
            }
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
    return None
