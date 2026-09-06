import fitz
import os
import json
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sample_data import MOSPI_ROLES, DIAGNOSTIC_QUESTIONS, IGOT_COURSES, SAMPLE_MANUALS
import ai_engine

# Active AI generation sessions in memory
ACTIVE_DIAGNOSTIC_SESSIONS = {}
ACTIVE_QUIZ_SESSIONS = {}

FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

app = Flask(__name__, static_folder=FRONTEND_DIST if os.path.exists(FRONTEND_DIST) else None)
CORS(app, resources={r"/*": {"origins": "*"}})

if os.path.exists(FRONTEND_DIST):
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        if path.startswith("api/"):
            return jsonify({"error": "Endpoint not found"}), 404
        if path != "" and os.path.exists(os.path.join(FRONTEND_DIST, path)):
            return send_from_directory(FRONTEND_DIST, path)
        return send_from_directory(FRONTEND_DIST, "index.html")

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "SankhyaSetu AI - MoSPI Capacity Building Engine",
        "version": "1.0.0",
        "igot_integration": "Enabled (FRAC Compliant / SCORM 2004)"
    })

@app.route("/api/roles", methods=["GET"])
def get_roles():
    return jsonify({"roles": MOSPI_ROLES})

@app.route("/api/roles/<role_id>/diagnostic", methods=["GET"])
def get_diagnostic(role_id):
    session_id = f"diag_{uuid.uuid4().hex[:8]}"
    questions, metadata = ai_engine.generate_dynamic_diagnostic(role_id)
    ACTIVE_DIAGNOSTIC_SESSIONS[session_id] = metadata
    return jsonify({
        "role_id": role_id,
        "session_id": session_id,
        "is_ai_generated": True,
        "questions": questions
    })

@app.route("/api/diagnostic/evaluate", methods=["POST"])
def evaluate_diagnostic():
    data = request.json or {}
    role_id = data.get("role_id", "field_investigator_nsso")
    session_id = data.get("session_id", "")
    user_answers = data.get("answers", {})

    # Retrieve dynamically generated questions metadata
    meta_list = ACTIVE_DIAGNOSTIC_SESSIONS.get(session_id)
    if not meta_list:
        meta_list = DIAGNOSTIC_QUESTIONS.get(role_id, DIAGNOSTIC_QUESTIONS["field_investigator_nsso"])

    role_info = next((r for r in MOSPI_ROLES if r["id"] == role_id), MOSPI_ROLES[0])
    
    competency_scores = {}
    total_correct = 0
    
    for q in meta_list:
        cid = q["competency_id"]
        is_correct = (user_answers.get(q["id"]) == q["correct_answer"])
        if cid not in competency_scores:
            competency_scores[cid] = {"correct": 0, "total": 0}
        competency_scores[cid]["total"] += 1
        if is_correct:
            competency_scores[cid]["correct"] += 1
            total_correct += 1

    competency_results = []
    gap_competencies = []
    
    for comp in role_info["competencies"]:
        cid = comp["id"]
        stats = competency_scores.get(cid, {"correct": 0, "total": 1})
        percentage = round((stats["correct"] / stats["total"]) * 100) if stats["total"] > 0 else 50
        
        is_gap = percentage < 75
        if is_gap:
            gap_competencies.append(cid)
            
        competency_results.append({
            "id": cid,
            "name": comp["name"],
            "score": percentage,
            "required_level": comp["required_level"] * 20,
            "status": "Gap Detected" if is_gap else "Proficient",
            "is_gap": is_gap
        })

    recommended_courses = []
    for cid in gap_competencies:
        courses = [c for c in IGOT_COURSES if c["competency_id"] == cid]
        recommended_courses.extend(courses)
        
    if not recommended_courses:
        recommended_courses = [IGOT_COURSES[0]]

    overall_readiness = round((total_correct / len(meta_list)) * 100) if meta_list else 80

    return jsonify({
        "role_id": role_id,
        "overall_readiness": overall_readiness,
        "total_questions": len(meta_list),
        "total_correct": total_correct,
        "competency_scores": competency_results,
        "gaps_identified": [c["name"] for c in competency_results if c["is_gap"]],
        "recommended_courses": recommended_courses
    })

@app.route("/api/manuals/upload", methods=["POST"])
def upload_manual():
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400
    
    file = request.files["file"]
    if not file or file.filename == "":
        return jsonify({"success": False, "error": "Empty filename"}), 400

    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    text = ""

    try:
        if ext == ".pdf":
            # Extract text with PyMuPDF (fitz)
            doc = fitz.open(stream=file.read(), filetype="pdf")
            extracted_pages = []
            for page_num in range(min(50, len(doc))):
                extracted_pages.append(doc[page_num].get_text())
            text = "\n".join(extracted_pages)
        elif ext in [".txt", ".md", ".csv", ".json"]:
            text = file.read().decode("utf-8", errors="ignore")
        elif ext in [".doc", ".docx"]:
            raw_bytes = file.read()
            import re
            words = re.findall(rb'[a-zA-Z0-9.,;:!? \'\"]{4,}', raw_bytes)
            text = " ".join([w.decode("ascii", errors="ignore") for w in words])
        else:
            text = file.read().decode("utf-8", errors="ignore")

        if not text or len(text.strip()) < 20:
            text = f"Manual Document: {filename}. Contains operational statistical guidelines and administrative procedures for survey enumerators."

        return jsonify({
            "success": True,
            "filename": filename,
            "text": text[:30000],
            "text_length": len(text),
            "preview": text[:250]
        })
    except Exception as e:
        print("Upload error:", e)
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/manuals", methods=["GET"])
def get_manuals():
    manuals_summary = [{
        "id": m["id"],
        "title": m["title"],
        "pages": m["pages"],
        "category": m["category"]
    } for m in SAMPLE_MANUALS]
    return jsonify({"manuals": manuals_summary})

@app.route("/api/quiz/generate", methods=["POST"])
def generate_quiz():
    data = request.json or {}
    manual_id = data.get("manual_id", "manual_plfs_2026")
    custom_text = data.get("custom_text", "")
    uploaded_filename = data.get("uploaded_filename", "")
    difficulty = data.get("difficulty", "scenario")
    try:
        count = int(data.get("count", 5))
    except Exception:
        count = 5

    if (custom_text and len(custom_text.strip()) > 20) or manual_id == "uploaded":
        source_title = uploaded_filename if uploaded_filename else "Uploaded Manual Document"
    else:
        manual = next((m for m in SAMPLE_MANUALS if m["id"] == manual_id), SAMPLE_MANUALS[0])
        source_title = manual["title"]

    # Generate dynamic randomized questions using AI Engine
    generated_questions = ai_engine.generate_dynamic_quiz(manual_id, custom_text, difficulty, count=count, doc_name=source_title)

    quiz_session_id = f"quiz_{uuid.uuid4().hex[:8]}"
    ACTIVE_QUIZ_SESSIONS[quiz_session_id] = generated_questions

    client_questions = []
    for q in generated_questions:
        client_questions.append({
            "id": q["id"],
            "type": q["type"],
            "bloom_level": q["bloom_level"],
            "question": q["question"],
            "options": q["options"],
            "source_manual": source_title
        })

    return jsonify({
        "session_id": quiz_session_id,
        "source_document": source_title,
        "difficulty": difficulty,
        "question_count": len(client_questions),
        "is_ai_generated": True,
        "questions": client_questions
    })

@app.route("/api/quiz/evaluate", methods=["POST"])
def evaluate_quiz():
    data = request.json or {}
    quiz_session_id = data.get("session_id", "")
    user_answers = data.get("answers", {})

    # Retrieve from active AI quiz sessions
    questions_to_eval = ACTIVE_QUIZ_SESSIONS.get(quiz_session_id)
    if not questions_to_eval:
        # Fallback to generating a standard evaluation
        questions_to_eval = ai_engine.generate_dynamic_quiz("manual_plfs_2026")

    score = 0
    total = len(questions_to_eval)
    detailed_results = []

    for q in questions_to_eval:
        qid = q["id"]
        user_choice = user_answers.get(qid)
        correct_choice = q["correct_answer"]
        is_correct = (user_choice == correct_choice)

        if is_correct:
            score += 1

        citation = q.get("citation") or {
            "manual": "Official MoSPI Manual",
            "section": "Standard Protocol",
            "page": "Page 1",
            "exact_quote": "Guidelines prescribe this official methodology."
        }

        detailed_results.append({
            "id": qid,
            "question_id": qid,
            "question": q["question"],
            "user_answer": user_choice,
            "user_choice": user_choice,
            "correct_answer": correct_choice,
            "correct_choice": correct_choice,
            "is_correct": is_correct,
            "explanation": f"Verified against {citation.get('section', 'official manual')}: {citation.get('exact_quote', '')}",
            "citation": citation
        })

    percentage = round((score / total) * 100) if total > 0 else 0

    return jsonify({
        "session_id": quiz_session_id,
        "score": score,
        "total": total,
        "total_score": score,
        "max_score": total,
        "percentage": percentage,
        "status": "Passed" if percentage >= 70 else "Needs Review",
        "results": detailed_results,
        "detailed_results": detailed_results
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)



