# SankhyaSetu AI (सांख्य सेतु)
### AI-Enabled Competency Gap Identification & Learning Platform for India's Official Statistical System (OSS)
**Hackathon Problem Statement ID:** SIH26101  
**Organization:** Ministry of Statistics and Programme Implementation (MoSPI), Government of India  
**Theme:** Smart Education | **Category:** Software  

---

## 🌟 Key Features Implemented

### 1. Officer Competency Hub (Flow 1)
- **Role Selection:** Field Investigator (NSSO), Junior Statistical Officer (CSO), Survey Supervisor (ASUSE).
- **Baseline Diagnostic Assessment:** Adaptive 5-question test covering Sampling, Non-Response Protocols, CAPI software, and Data Verification.
- **Dynamic Competency Radar:** Visual scorecard displaying exact scores against required FRAC proficiency levels.
- **iGOT Karmayogi Recommendations:** Real-time course matchmaking linking detected gaps to certified training modules.

### 2. Automated AI Quiz & MCQ Arena (Flow 2)
- **Document Ingestion:** Ingests official MoSPI guidelines (*Periodic Labour Force Survey 2026 Manual*, *Consumer Price Index Rural Manual*), or custom circular text.
- **Bloom's Taxonomy Questioning:** Generates scenario-based field dilemmas, analytical audit challenges, and procedural recall questions.
- **Verified Source Citations (Zero Hallucination):** Every question and evaluation provides the exact **manual name, section number, page number, and quote** proving the ground truth answer.

### 3. iGOT Karmayogi Micro-Learning Lab (Video Timestamp Player)
- **Automated Timestamp Navigation:** Instead of watching 1-hour lectures, officers jump straight to the exact 3-minute clip addressing their weakness (e.g., `02:05 - Hamlet Group Formation Criteria`).
- **60-Second AI Cheat-Sheets:** Rapid summary points for mobile/field reference.

### 4. Ministry Leadership Analytics
- **State-Wise Readiness Heatmap:** Tracks average officer readiness across states (MP, UP, Maharashtra, TN, Bihar) to guide pre-survey intervention workshops.

---

## 🚀 How to Run the Project

### Option A: One-Click Launch (Recommended)
Simply double-click:
`start_all.bat`
It will launch both the backend and frontend servers and automatically open your web browser to `http://localhost:5173`.

### Option B: Manual Launch
1. **Backend:**
   ```bash
   cd backend
   python app.py
   # Runs on http://127.0.0.1:8000
   ```
2. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   # Runs on http://127.0.0.1:5173
   ```

---

## 🏗️ Architecture & Technology Stack
- **Frontend:** React 18, Vite, Tailwind CSS v4, Lucide Icons, Recharts (Radar & Analytics charts).
- **Backend:** Python 3.14, Flask, Flask-CORS, PyPDF/PDFPlumber RAG pipeline.
- **Government Framework:** Aligned with Mission Karmayogi FRAC (Framework for Roles, Activities, and Competencies) & SCORM/xAPI e-learning protocols.
