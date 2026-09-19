"""
Migration script to create 3 dedicated tables in Neon PostgreSQL:
1. officers (Existing normal officers - completely untouched)
2. supervisors (Card 2: Supervisory Cadres & Squad Leads)
3. directorate_cadres (Card 3: Directorate General / Main Boss)
"""
import sys
import os
from werkzeug.security import generate_password_hash

sys.path.append(os.path.dirname(__file__))
import db

def run_migration():
    print("Connecting to Neon PostgreSQL...")
    pool = db.get_connection_pool()
    if pool is None:
        print("ERROR: Could not connect to Neon PostgreSQL.")
        return False

    with db.get_db_cursor(commit=True) as cur:
        if cur is None:
            print("ERROR: Cursor unavailable.")
            return False

        # 1. Create table for Card 2: supervisors
        print("Creating table: supervisors...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS supervisors (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'supervisor',
                cadre_title VARCHAR(255) DEFAULT 'Senior Statistical Officer (SSO)',
                department VARCHAR(255) DEFAULT 'Field Operations Division',
                field_id VARCHAR(100) DEFAULT 'survey_supervisor_asuse',
                badge VARCHAR(100) DEFAULT 'SSO-CADRE',
                auth_provider VARCHAR(50) DEFAULT 'manual',
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 2. Create table for Card 3: directorate_cadres
        print("Creating table: directorate_cadres...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS directorate_cadres (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'boss',
                cadre_title VARCHAR(255) DEFAULT 'Deputy Director General (DDG)',
                department VARCHAR(255) DEFAULT 'MoSPI Central Directorate, New Delhi',
                badge VARCHAR(100) DEFAULT 'DDG-HQ-001',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 3. Seed Card 2 Supervisors
        initial_supervisors = [
            (
                "supervisor1@gmail.com",
                generate_password_hash("123456"),
                "Rajesh Kumar",
                "supervisor",
                "Senior Statistical Officer (SSO)",
                "Delhi North Cadre Unit #04",
                "survey_supervisor_asuse",
                "SSO-DEL-101",
                "manual",
                "active"
            ),
            (
                "supervisor2@gmail.com",
                generate_password_hash("123456"),
                "Sunita Devi",
                "supervisor",
                "Senior Statistical Officer (SSO)",
                "Varanasi Cantt Unit #08",
                "field_investigator_nsso",
                "SSO-VNS-108",
                "manual",
                "active"
            ),
            (
                "supervisor3@gmail.com",
                generate_password_hash("123456"),
                "Anil Mehta",
                "supervisor",
                "Senior Statistical Officer (SSO)",
                "Bengaluru South Unit #12",
                "junior_statistical_officer_cso",
                "SSO-BLR-114",
                "manual",
                "active"
            )
        ]

        for s in initial_supervisors:
            cur.execute("""
                INSERT INTO supervisors (email, password, name, role, cadre_title, department, field_id, badge, auth_provider, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (email) DO UPDATE SET
                    password = EXCLUDED.password,
                    name = EXCLUDED.name,
                    role = EXCLUDED.role,
                    cadre_title = EXCLUDED.cadre_title,
                    department = EXCLUDED.department,
                    field_id = EXCLUDED.field_id,
                    badge = EXCLUDED.badge;
            """, s)

        # 4. Seed Card 3 Boss into directorate_cadres
        cur.execute("""
            INSERT INTO directorate_cadres (email, password, name, role, cadre_title, department, badge)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (email) DO UPDATE SET
                password = EXCLUDED.password,
                name = EXCLUDED.name,
                role = EXCLUDED.role,
                cadre_title = EXCLUDED.cadre_title,
                department = EXCLUDED.department,
                badge = EXCLUDED.badge;
        """, (
            "boss@gmail.com",
            generate_password_hash("123456"),
            "Dr. S. K. Mukherjee",
            "boss",
            "Deputy Director General (DDG)",
            "MoSPI Central Directorate, New Delhi",
            "DDG-HQ-001"
        ))

        print("SUCCESS: Both 'supervisors' (Card 2) and 'directorate_cadres' (Card 3) created and populated in Neon Cloud PostgreSQL!")
        return True

if __name__ == "__main__":
    run_migration()
