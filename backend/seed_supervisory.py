"""
One-time / startup seeding script to populate Neon Cloud PostgreSQL with 
Supervisory Cadres, Squad Submissions (Option B), and Field Officers.
"""
import sys
import os
import json

sys.path.append(os.path.dirname(__file__))
import db

def run_seed():
    print("Connecting to Neon PostgreSQL...")
    pool = db.get_connection_pool()
    if pool is None:
        print("ERROR: Could not connect to Neon PostgreSQL.")
        return False

    with db.get_db_cursor(commit=True) as cur:
        # 1. Ensure table squad_submissions exists
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

        # 2. Add extra columns to officers if not present
        cur.execute("ALTER TABLE officers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;")
        cur.execute("ALTER TABLE officers ADD COLUMN IF NOT EXISTS phone VARCHAR(50);")
        cur.execute("ALTER TABLE officers ADD COLUMN IF NOT EXISTS supervisor_email VARCHAR(255);")

        # 3. Insert / Update Seed Accounts (Supervisors + Main Boss + Officers)
        all_accounts = [
            # Supervisors
            ("rajesh.supervisor@mospi.gov.in", "Rajesh Kumar", "survey_supervisor_asuse", "Senior Statistical Officer (ASUSE)", "Delhi North Unit #04", "manual", "supervisor123", "+91 98100-00101"),
            ("sunita.supervisor@mospi.gov.in", "Sunita Devi", "field_investigator_nsso", "Senior Statistical Officer (PLFS)", "Varanasi Cantt Unit #08", "manual", "supervisor123", "+91 98100-00108"),
            ("anil.supervisor@mospi.gov.in", "Anil Mehta", "junior_statistical_officer_cso", "Senior Statistical Officer (Prices)", "Bengaluru South Unit #12", "manual", "supervisor123", "+91 98100-00114"),
            # Main Boss
            ("director.general@mospi.gov.in", "Dr. S. K. Mukherjee", "director_general", "Deputy Director General (DDG)", "MoSPI Central Directorate, New Delhi", "manual", "director123", "+91 98100-00001"),
            # ASUSE Squad Officers
            ("amit.sharma@mospi.gov.in", "Amit Sharma", "survey_supervisor_asuse", "Field Investigator (ASUSE)", "Delhi North Unit #04", "manual", "officer123", "+91 98111-23041"),
            ("priya.verma@mospi.gov.in", "Priya Verma", "survey_supervisor_asuse", "Junior Statistical Officer (ASUSE)", "Delhi North Unit #04", "manual", "officer123", "+91 98222-77192"),
            ("rahul.deshmukh@mospi.gov.in", "Rahul Deshmukh", "survey_supervisor_asuse", "Field Investigator (ASUSE)", "Delhi North Unit #04", "manual", "officer123", "+91 98333-88410"),
            # PLFS Squad Officers
            ("vikram.m@mospi.gov.in", "Vikram Malhotra", "field_investigator_nsso", "Field Investigator (PLFS)", "Varanasi Cantt Unit #08", "manual", "officer123", "+91 98444-11029"),
            ("pooja.n@mospi.gov.in", "Pooja Nair", "field_investigator_nsso", "Junior Statistical Officer (PLFS)", "Varanasi Cantt Unit #08", "manual", "officer123", "+91 98555-66120"),
            ("manoj.t@mospi.gov.in", "Manoj Tiwari", "field_investigator_nsso", "Field Investigator (PLFS)", "Varanasi Cantt Unit #08", "manual", "officer123", "+91 98666-33918"),
            # Household / CSO Squad Officers
            ("suresh.p@mospi.gov.in", "Suresh Patel", "junior_statistical_officer_cso", "Field Investigator (CSO)", "Bengaluru South Unit #12", "manual", "officer123", "+91 98777-55019"),
            ("neha.g@mospi.gov.in", "Neha Gupta", "junior_statistical_officer_cso", "Junior Statistical Officer (CSO)", "Bengaluru South Unit #12", "manual", "officer123", "+91 98888-22941"),
            ("deepak.r@mospi.gov.in", "Deepak Rawat", "junior_statistical_officer_cso", "Field Investigator (CSO)", "Bengaluru South Unit #12", "manual", "officer123", "+91 98999-11488")
        ]

        for email, name, role_id, role_name, dept, auth, pwd, phone in all_accounts:
            cur.execute("""
                INSERT INTO officers (email, name, role_id, role_name, department, auth_provider, password, phone, last_active, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, TRUE)
                ON CONFLICT (email) 
                DO UPDATE SET 
                    name = EXCLUDED.name,
                    role_id = EXCLUDED.role_id,
                    role_name = EXCLUDED.role_name,
                    department = EXCLUDED.department,
                    phone = EXCLUDED.phone,
                    password = COALESCE(officers.password, EXCLUDED.password);
            """, (email, name, role_id, role_name, dept, auth, pwd, phone))

        # 4. Seed Squad Submissions (Option B data)
        squads = [
            ('squad_asuse_delhi', 'Delhi North Cadre Unit #04', 'survey_supervisor_asuse', 'Rajesh Kumar', 'rajesh.supervisor@mospi.gov.in', 'submitted', 'Today, 5:02 PM', 3, 2, 75.0),
            ('squad_plfs_varanasi', 'Varanasi Cantt Unit #08', 'field_investigator_nsso', 'Sunita Devi', 'sunita.supervisor@mospi.gov.in', 'submitted', 'Today, 4:45 PM', 3, 3, 82.0),
            ('squad_household_bengaluru', 'Bengaluru South Unit #12', 'junior_statistical_officer_cso', 'Anil Mehta', 'anil.supervisor@mospi.gov.in', 'pending', None, 3, 2, 62.3)
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

        # 5. Seed Assessment Attempts for historical scores
        scores = [
            ("amit.sharma@mospi.gov.in", "survey_supervisor_asuse", 88, True, {"Enterprise Frame Verification": 90, "GVA & Balance Sheet Audits": 86, "Unit Non-Response Weights": 88, "Coverage Checks": 88}),
            ("priya.verma@mospi.gov.in", "survey_supervisor_asuse", 62, False, {"Enterprise Frame Verification": 65, "GVA & Balance Sheet Audits": 58, "Unit Non-Response Weights": 62, "Coverage Checks": 63}),
            ("vikram.m@mospi.gov.in", "field_investigator_nsso", 84, True, {"Multi-Stage Sampling & Listing": 85, "Non-Response Revisit Protocols": 82, "CAPI Tablet Software": 86, "Data Scrutiny": 83}),
            ("pooja.n@mospi.gov.in", "field_investigator_nsso", 79, True, {"Multi-Stage Sampling & Listing": 78, "Non-Response Revisit Protocols": 80, "CAPI Tablet Software": 80, "Data Scrutiny": 78}),
            ("manoj.t@mospi.gov.in", "field_investigator_nsso", 83, True, {"Multi-Stage Sampling & Listing": 84, "Non-Response Revisit Protocols": 82, "CAPI Tablet Software": 82, "Data Scrutiny": 84}),
            ("suresh.p@mospi.gov.in", "junior_statistical_officer_cso", 72, True, {"Base Year Revisions": 70, "Price Quotation Scrutiny": 75, "NIC-2008 Classification": 72, "Imputation Protocols": 71}),
            ("neha.g@mospi.gov.in", "junior_statistical_officer_cso", 70, True, {"Base Year Revisions": 72, "Price Quotation Scrutiny": 68, "NIC-2008 Classification": 70, "Imputation Protocols": 70}),
            ("deepak.r@mospi.gov.in", "junior_statistical_officer_cso", 45, False, {"Base Year Revisions": 45, "Price Quotation Scrutiny": 48, "NIC-2008 Classification": 42, "Imputation Protocols": 45})
        ]

        for email, role_id, score, passed, radar in scores:
            cur.execute("""
                INSERT INTO assessment_attempts (officer_email, role_id, score_achieved, passed, radar_scores, detailed_answers, attempt_timestamp)
                VALUES (%s, %s, %s, %s, %s::jsonb, %s::jsonb, CURRENT_TIMESTAMP)
            """, (email, role_id, score, passed, json.dumps(radar), json.dumps([])))

        print("SUCCESS: Seeded all 3 Supervisors, Main Boss, 9 Officers, and Squad Submissions into Neon PostgreSQL!")
        return True

if __name__ == "__main__":
    run_seed()
