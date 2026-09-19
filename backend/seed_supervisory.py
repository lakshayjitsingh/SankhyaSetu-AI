"""
One-time / startup seeding script to populate Neon Cloud PostgreSQL with 
dedicated Supervisory Cadres table (supervisory_cadres) for the 3 Supervisors and Main Boss.
"""
import sys
import os
import json
from werkzeug.security import generate_password_hash

sys.path.append(os.path.dirname(__file__))
import db

def run_seed():
    print("Connecting to Neon PostgreSQL...")
    pool = db.get_connection_pool()
    if pool is None:
        print("ERROR: Could not connect to Neon PostgreSQL.")
        return False

    with db.get_db_cursor(commit=True) as cur:
        # 1. Create separate table: supervisory_cadres (COMPLETELY ISOLATED from officers table)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS supervisory_cadres (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,              -- 'supervisor' or 'boss'
                cadre_title VARCHAR(255) NOT NULL,      -- 'Senior Statistical Officer' / 'Deputy Director General'
                department VARCHAR(255) NOT NULL,       -- e.g. 'Delhi North Unit #04'
                field_id VARCHAR(100),                  -- 'survey_supervisor_asuse', 'field_investigator_nsso', 'junior_statistical_officer_cso'
                badge VARCHAR(100),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 2. Populate the 4 dedicated admin accounts into supervisory_cadres
        supervisory_accounts = [
            (
                "supervisor1@gmail.com",
                generate_password_hash("123456"),
                "Rajesh Kumar",
                "supervisor",
                "Senior Statistical Officer (SSO)",
                "Delhi North Cadre Unit #04",
                "survey_supervisor_asuse",
                "SSO-DEL-101"
            ),
            (
                "supervisor2@gmail.com",
                generate_password_hash("123456"),
                "Sunita Devi",
                "supervisor",
                "Senior Statistical Officer (SSO)",
                "Varanasi Cantt Unit #08",
                "field_investigator_nsso",
                "SSO-VNS-108"
            ),
            (
                "supervisor3@gmail.com",
                generate_password_hash("123456"),
                "Anil Mehta",
                "supervisor",
                "Senior Statistical Officer (SSO)",
                "Bengaluru South Unit #12",
                "junior_statistical_officer_cso",
                "SSO-BLR-114"
            ),
            (
                "boss@gmail.com",
                generate_password_hash("123456"),
                "Dr. S. K. Mukherjee",
                "boss",
                "Deputy Director General (DDG)",
                "MoSPI Central Directorate, New Delhi",
                "all_divisions",
                "DDG-HQ-001"
            )
        ]

        for email, pwd_hash, name, role, cadre, dept, field_id, badge in supervisory_accounts:
            cur.execute("""
                INSERT INTO supervisory_cadres (email, password, name, role, cadre_title, department, field_id, badge)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (email)
                DO UPDATE SET 
                    password = EXCLUDED.password,
                    name = EXCLUDED.name,
                    role = EXCLUDED.role,
                    cadre_title = EXCLUDED.cadre_title,
                    department = EXCLUDED.department,
                    field_id = EXCLUDED.field_id,
                    badge = EXCLUDED.badge;
            """, (email, pwd_hash, name, role, cadre, dept, field_id, badge))

        # 3. Ensure squad_submissions table exists for Option B tracking
        cur.execute("""
            CREATE TABLE IF NOT EXISTS squad_submissions (
                id SERIAL PRIMARY KEY,
                squad_id VARCHAR(100) UNIQUE NOT NULL,
                squad_name VARCHAR(255) NOT NULL,
                field_id VARCHAR(100) NOT NULL,
                supervisor_name VARCHAR(255) NOT NULL,
                supervisor_email VARCHAR(255) NOT NULL,
                submission_status VARCHAR(50) DEFAULT 'pending',
                submitted_at VARCHAR(100),
                officer_count INT DEFAULT 3,
                active_count INT DEFAULT 3,
                avg_score NUMERIC(5,2) DEFAULT 0.0,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        squads = [
            ('squad_asuse_delhi', 'Delhi North Cadre Unit #04', 'survey_supervisor_asuse', 'Rajesh Kumar', 'supervisor1@gmail.com', 'submitted', 'Today, 5:02 PM', 3, 2, 75.0),
            ('squad_plfs_varanasi', 'Varanasi Cantt Unit #08', 'field_investigator_nsso', 'Sunita Devi', 'supervisor2@gmail.com', 'submitted', 'Today, 4:45 PM', 3, 3, 82.0),
            ('squad_household_bengaluru', 'Bengaluru South Unit #12', 'junior_statistical_officer_cso', 'Anil Mehta', 'supervisor3@gmail.com', 'pending', None, 3, 2, 62.3)
        ]

        for sq in squads:
            cur.execute("""
                INSERT INTO squad_submissions 
                (squad_id, squad_name, field_id, supervisor_name, supervisor_email, submission_status, submitted_at, officer_count, active_count, avg_score, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (squad_id)
                DO UPDATE SET
                    squad_name = EXCLUDED.squad_name,
                    supervisor_name = EXCLUDED.supervisor_name,
                    supervisor_email = EXCLUDED.supervisor_email,
                    submission_status = EXCLUDED.submission_status,
                    submitted_at = EXCLUDED.submitted_at,
                    officer_count = EXCLUDED.officer_count,
                    active_count = EXCLUDED.active_count,
                    avg_score = EXCLUDED.avg_score,
                    updated_at = CURRENT_TIMESTAMP;
            """, sq)

        print("SUCCESS: Seeded supervisory_cadres table with supervisor1, supervisor2, supervisor3, and boss!")
        return True

if __name__ == "__main__":
    run_seed()
