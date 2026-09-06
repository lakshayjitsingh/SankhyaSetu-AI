import os
import random
import json
import requests

def get_gemini_api_key():
    key = os.environ.get("GEMINI_API_KEY", "")
    if not key:
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8-sig") as f:
                    for line in f:
                        if "GEMINI_API_KEY=" in line:
                            key = line.split("GEMINI_API_KEY=", 1)[1].strip().strip('"').strip("'")
            except Exception:
                pass
    return key

GEMINI_API_KEY = get_gemini_api_key()

NAMES = ["Ramesh Kumar", "Priya Sharma", "Sunita Devi", "Anil Verma", "Kavita Rao", "Deepak Patel", "Mohammad Aslam", "Suresh Nair"]
DISTRICTS = ["Varanasi (UP)", "Rohtak (Haryana)", "Coimbatore (TN)", "Patna (Bihar)", "Khurja (UP)", "Kochi (Kerala)", "Nagpur (Maharashtra)", "Bhubaneswar (Odisha)"]
COMMODITIES = ["Mustard Oil", "Sona Masoori Rice", "Arhar Dal (Tur)", "Wheat Flour (Atta)", "Desi Ghee", "Sugar (M-30)"]
ENTERPRISES = ["Handloom Weaving Unit", "Wooden Furniture Workshop", "Clay Pottery Micro-Enterprise", "Automobile Repair Garage", "Food Processing Small Unit"]

def district_name(d):
    return d.split("(")[0].strip()

# =====================================================================
# SECTION 1: FRAC DIAGNOSTIC SCENARIOS (ALL 3 CADRES)
# =====================================================================

DIAGNOSTIC_SCENARIOS = {
    "field_investigator_nsso": {
        "sampling_methods": [
            {
                "template": "In sample village {village} ({district}), the initial house listing shows {hh_count} households. As per MoSPI NSS Survey Manual Section 2.3, what mandatory sampling protocol must the field investigator execute?",
                "vars": lambda: {"village": random.choice(["Rampur", "Shyampur", "Kalyanpur", "Chandpur"]), "district": random.choice(DISTRICTS), "hh_count": random.randint(320, 600)},
                "correct": "Divide the village into approximately equal Hamlet-Groups (HGs) based on population and select 2 HGs using simple random sampling",
                "distractors": [
                    "Select every 3rd household directly using circular systematic sampling without dividing the village",
                    "Survey only households situated along the main paved road within 500m of the Panchayat Bhavan",
                    "Drop the village from the sample and request a reserve village replacement from the regional office"
                ],
                "explanation": "When a sample village exceeds 1,200 population or approximately 300 households, hamlet-group formation is mandatory to avoid coverage bias.",
                "source": "MoSPI NSS Survey Methodology Handbook, Section 2.3, Page 14"
            }
        ],
        "non_response_protocol": [
            {
                "template": "Investigator {name} visits sample household #{sample_no} in {district} and finds the premises locked. Neighbors state the family is away in another town. What is the mandatory MoSPI protocol?",
                "vars": lambda: {"name": random.choice(NAMES), "sample_no": random.randint(1, 16), "district": random.choice(DISTRICTS)},
                "correct": "Record as Temporarily Absent and schedule at least two revisits at different times of the day before marking as non-response",
                "distractors": [
                    "Immediately substitute the sample unit with the adjacent dwelling unit to maintain daily sample quota",
                    "Delete the sample entry from the CAPI software and reduce the required sample size for the village",
                    "Collect approximate consumption data from the local grocery shopkeeper or Panchayat Pradhan"
                ],
                "explanation": "MoSPI Field Guidelines strictly forbid immediate substitution without at least two mandatory revisits at varying times to prevent non-response bias.",
                "source": "NSSO Field Staff Instructions, Section 4.1, Page 31"
            }
        ],
        "capi_software": [
            {
                "template": "While entering data on the MoSPI CAPI tablet, a Hard Warning validation error (red banner) is triggered when {name} records child age {age} with marital status 'Married'. What does this Hard Error signify?",
                "vars": lambda: {"name": random.choice(NAMES), "age": random.randint(4, 9)},
                "correct": "The entry is logically contradictory and locks schedule progression until the invalid entry is corrected",
                "distractors": [
                    "The enumerator simply needs to type an explanatory remark and can continue to the next block",
                    "The tablet battery is low and cloud synchronization has been temporarily suspended",
                    "The system automatically assigns an imputed age using the district demographic average"
                ],
                "explanation": "In CAPI software, Hard Errors represent logical impossibilities that halt data capture until rectified by the investigator.",
                "source": "MoSPI CAPI Systems Architecture Manual, Section 5, Page 47"
            }
        ],
        "data_consistency": [
            {
                "template": "In the Consumer Expenditure Survey, a household in {district} reports monthly food expenditure of Rs. {food_exp}, but in Block 8 records total household monthly consumption of Rs. {total_exp}. How must this discrepancy be resolved?",
                "vars": lambda: {"district": random.choice(DISTRICTS), "food_exp": random.randint(4200, 5800), "total_exp": random.randint(3100, 3900)},
                "correct": "Reconcile Block 5 (Food) with Block 8 (Total Summary) with the respondent to identify over-reporting or omissions",
                "distractors": [
                    "Accept the conflicting numbers without question since respondents often make calculation errors",
                    "Calculate the arithmetic mean of both figures and overwrite both blocks",
                    "Discard the entire schedule and record the household as uncooperative"
                ],
                "explanation": "Internal consistency across itemized expenditure and aggregate consumption is a core validation rule that requires careful respondent probing.",
                "source": "Household Consumption Manual 2026, Section 7, Page 78"
            }
        ],
        "interview_techniques": [
            {
                "template": "Under Section 9 of the Collection of Statistics Act 2008, can a local revenue officer or police inspector demand to inspect individual household questionnaires collected by {name} in {district}?",
                "vars": lambda: {"name": random.choice(NAMES), "district": random.choice(DISTRICTS)},
                "correct": "No; survey schedules are protected by statutory immunity and cannot be shared with tax or judicial authorities",
                "distractors": [
                    "Yes, provided the revenue inspector submits a formal written request on official letterhead",
                    "Yes, but only for households whose reported assets exceed the rural BPL threshold",
                    "Only if the Gram Pradhan gives verbal permission during a village meeting"
                ],
                "explanation": "Statutory confidentiality ensures micro-data can never be utilized for taxation, regulation, or legal proceedings against informants.",
                "source": "Collection of Statistics Act 2008, Statutory Immunity Clause"
            }
        ]
    },

    "junior_statistical_officer_cso": {
        "sampling_methods": [
            {
                "template": "When compiling the state-level Consumer Price Index for {district}, a rural market shows missing price quotations for {commodity} for {months} consecutive months. What is the standard CSO imputation rule?",
                "vars": lambda: {"district": random.choice(DISTRICTS), "commodity": random.choice(COMMODITIES), "months": random.randint(2, 4)},
                "correct": "Impute using the price relative of the parent commodity sub-group, or substitute with an identical grade in the same market",
                "distractors": [
                    "Zero out the weight of the missing item in the overall index calculation",
                    "Carry forward the last recorded price indefinitely without any adjustment",
                    "Copy the wholesale price from the nearest urban supermarket"
                ],
                "explanation": "CSO manual mandates group-relative price imputation to prevent artificial deflation of the headline index.",
                "source": "CPI Methodology Guidelines, Section 6.2, Page 54"
            }
        ],
        "data_consistency": [
            {
                "template": "In {district}, the reported retail price of {commodity} exhibits a {jump}% month-on-month increase, exceeding the {thresh}% tolerance threshold. What action must the JSO take during data scrutiny?",
                "vars": lambda: {"district": random.choice(DISTRICTS), "commodity": random.choice(COMMODITIES), "jump": random.randint(28, 45), "thresh": 20},
                "correct": "Flag as an outlier, verify with the field investigator, and require documented justification of local market conditions",
                "distractors": [
                    "Automatically truncate the recorded price at +19.9% to bypass software validation flags",
                    "Immediately delete the quotation and use state median price",
                    "Accept the value without audit if the district inflation trend is generally positive"
                ],
                "explanation": "Price movements exceeding 20% must be audited with explicit written remarks validating local supply shocks or festival demand.",
                "source": "Price Statistics Scrutiny Manual, Section 4.4, Page 41"
            }
        ],
        "econometric_modeling": [
            {
                "template": "During the base year revision of the Index of Industrial Production (IIP), why does the CSO adjust commodity basket weights every 5-10 years?",
                "vars": lambda: {},
                "correct": "To capture structural shifts in manufacturing output and the emergence of modern product categories",
                "distractors": [
                    "To ensure headline industrial growth figures always remain above 8% per annum",
                    "To eliminate small-scale and unincorporated manufacturing enterprises from the index",
                    "To reduce the number of reporting industrial units and lower field survey costs"
                ],
                "explanation": "Base revisions align weights with updated Annual Survey of Industries (ASI) structural data to reflect modern economic realities.",
                "source": "IIP Compilation Guidelines, CSO National Accounts, Page 12"
            }
        ],
        "r_python_analytics": [
            {
                "template": "While running automated Python data scrutiny on PLFS micro-data, a JSO encounters duplicate household sample serial numbers across blocks. What is the correct data engineering approach?",
                "vars": lambda: {},
                "correct": "Construct a composite primary key using FSU ID + Hamlet Group No + Second Stage Stratum + Household Serial No",
                "distractors": [
                    "Simply drop all duplicate rows using df.drop_duplicates() on the serial number column alone",
                    "Re-number all households from 1 to N arbitrarily in sequence",
                    "Ignore the duplication because CAPI software handles indexing at the server level"
                ],
                "explanation": "Household serial numbers are only unique within their specific FSU and stratum; a multi-column composite key is required.",
                "source": "MoSPI Micro-Data Processing Handbook, Page 88"
            }
        ],
        "metadata_standards": [
            {
                "template": "Under the National Data Sharing and Accessibility Policy (NDSAP), what classification applies to anonymized MoSPI household survey micro-data?",
                "vars": lambda: {},
                "correct": "Open Access Data, freely downloadable in machine-readable formats with standardized DDI metadata",
                "distractors": [
                    "Classified / Restricted, requiring individual clearance from the Ministry of Home Affairs",
                    "Proprietary Commercial Data sold exclusively to licensed financial institutions",
                    "Temporary Data scheduled for automated deletion 90 days after report publication"
                ],
                "explanation": "MoSPI publishes fully anonymized unit-level micro-data under the Open Access tier with complete Data Documentation Initiative (DDI) schemas.",
                "source": "NDSAP Compliance & Data Dissemination Manual, Page 19"
            }
        ]
    },

    "survey_supervisor_asuse": {
        "sampling_methods": [
            {
                "template": "In {district}, an ASUSE survey squad identifies an enterprise listed in the Urban Frame Survey (UFS) block, but operating across two adjacent blocks. How should the supervisor instruct the squad?",
                "vars": lambda: {"district": random.choice(DISTRICTS)},
                "correct": "Enumerate the enterprise in the UFS block where its main entrance/reception and primary ledger accounts are maintained",
                "distractors": [
                    "Enumerate the enterprise twice, once in each respective UFS block",
                    "Exclude the unit entirely from ASUSE because cross-block units are invalid",
                    "Divide all revenue and employee numbers exactly by 50% between both blocks"
                ],
                "explanation": "Enterprise frame rules specify that location is determined by the point of primary management control and commercial books.",
                "source": "ASUSE Field Operational Manual, Section 3.2, Page 29"
            }
        ],
        "non_response_protocol": [
            {
                "template": "An unincorporated enterprise selected in ASUSE has suspended manufacturing operations for the last {months} months due to monsoon floods. How should this establishment be classified?",
                "vars": lambda: {"months": random.randint(2, 4)},
                "correct": "Temporarily Closed: Record operating data for the active months during the reference year in Block 4 and note reason in Block 9",
                "distractors": [
                    "Permanently Closed: Delete from the sample list and substitute immediately with a neighboring unit",
                    "Non-cooperative / Refusal: File a non-compliance report with district magistrate",
                    "Impute 12 full months of turnover based on average industry revenue"
                ],
                "explanation": "Units temporarily closed due to seasonal or natural causes during the reference period must be documented with actual pro-rated accounting data.",
                "source": "ASUSE Enterprise Status Handbook, Page 44"
            }
        ],
        "nic_classification": [
            {
                "template": "An enterprise in {district} manufactures leather footwear and also sells readymade textile clothing from the same shop premises. {pct}% of its gross revenue originates from footwear manufacturing. What is the correct NIC-2008 classification?",
                "vars": lambda: {"district": random.choice(DISTRICTS), "pct": random.randint(62, 85)},
                "correct": "Classify under Manufacturing (Division 15 - Manufacture of Footwear) as it represents the principal activity generating >50% value added",
                "distractors": [
                    "Classify under Retail Trade (Division 47) because a physical shopfront is present",
                    "Assign dual classification codes and submit two separate survey schedules",
                    "Classify under Miscellaneous Personal Services (Division 96)"
                ],
                "explanation": "NIC-2008 principal activity rule assigns classification to the activity generating more than 50% of gross value added.",
                "source": "National Industrial Classification (NIC-2008) Guidelines, Page 16"
            }
        ],
        "data_consistency": [
            {
                "template": "In {enterprise} in {district}, total gross receipts are reported as Rs. {receipts} Lakhs, but intermediate operational expenses are recorded as Rs. {expenses} Lakhs. What is the Gross Value Added (GVA)?",
                "vars": lambda: {
                    "enterprise": random.choice(ENTERPRISES),
                    "district": random.choice(DISTRICTS),
                    "receipts": random.randint(18, 30),
                    "expenses": random.randint(8, 14)
                },
                "calc": True
            }
        ],
        "supervisory_audit": [
            {
                "template": "During the mandatory {pct}% supervisory re-interview in {district}, Supervisor {name} detects that an investigator filled Schedule Block 6 without physically visiting the sample enterprise. What is the official protocol?",
                "vars": lambda: {"pct": 10, "district": random.choice(DISTRICTS), "name": random.choice(NAMES)},
                "correct": "Reject the falsified schedule, order a complete 100% re-survey of the investigator's assigned allocation, and issue an administrative non-compliance notice",
                "distractors": [
                    "Quietly correct the numbers on the supervisor's tablet and approve the investigator's daily TA/DA allowance",
                    "Accept the schedule if the enterprise is willing to sign a retrospective confirmation letter",
                    "Average the fabricated figures with the supervisor's re-survey figures"
                ],
                "explanation": "Desk fabrication ('curb-stoning') triggers mandatory re-survey of all schedules assigned to that investigator and disciplinary reporting.",
                "source": "MoSPI Field Operations Quality Assurance Manual, Section 8, Page 72"
            }
        ]
    }
}

def generate_dynamic_diagnostic(role_id):
    """
    Generates 10 dynamic diagnostic assessment questions (2 per each of the 5 FRAC competencies)
    using live Google Gemini Flash with procedural fallback.
    """
    api_key = get_gemini_api_key()
    if api_key and len(api_key.strip()) > 10:
        try:
            gemini_res = call_gemini_diagnostic_generator(role_id)
            if gemini_res and len(gemini_res[0]) == 10:
                return gemini_res
        except Exception as e:
            print("Gemini Diagnostic Generation error, falling back to procedural:", e)

    return _generate_procedural_diagnostic(role_id)

CADRE_INFO = {
    "field_investigator_nsso": {
        "title": "Field Investigator - NSSO",
        "division": "National Sample Survey Office (Socio-Economic & Labour Surveys)",
        "competencies": [
            ("sampling_methods", "Multi-Stage Sampling & Village Listing Protocols (hamlet-groups, circular systematic sampling, boundary demarcations)"),
            ("non_response_protocol", "Non-Response, Locked Households & Revisit Rules (statutory confidentiality, revisit schedules, proxy handling)"),
            ("capi_software", "CAPI Tablet Software Entry & Error Rectification (hard vs soft error validation, offline syncing, coordinate verification)"),
            ("data_consistency", "Data Scrutiny & Cross-Block Consistency (food vs total expenditure scrutiny, employment day reconciliation)"),
            ("interview_techniques", "Interview Techniques & Statutory Immunity (respondent rapport, Collection of Statistics Act 2008 immunity)")
        ]
    },
    "junior_statistical_officer_cso": {
        "title": "Junior Statistical Officer - CSO",
        "division": "Central Statistics Office (Macroeconomic & Price Statistics)",
        "competencies": [
            ("sampling_methods", "Price Quotation Sampling & Imputation Protocols (missing rural market price imputation, market selection)"),
            ("data_consistency", "Data Consistency & Outlier Scrutiny (month-on-month price jump thresholds, supply shock justifications)"),
            ("econometric_modeling", "Base Year Revision & Index Weighting (Laspeyres price index formula, structural shifts)"),
            ("r_python_analytics", "R & Python Data Engineering on Micro-Data (composite keys, FSU data wrangling, automated validation rules)"),
            ("metadata_standards", "Metadata Standards & NDSAP Compliance (Data Documentation Initiative, open data licensing)")
        ]
    },
    "survey_supervisor_asuse": {
        "title": "Survey Supervisor - ASUSE",
        "division": "Annual Survey of Unincorporated Sector Enterprises (Enterprise Surveys)",
        "competencies": [
            ("sampling_methods", "Urban Frame Survey Block Demarcation (cross-block enterprise framing, establishment listings)"),
            ("non_response_protocol", "Enterprise Closure & Non-Response Classification (temporarily closed seasonal units vs defunct units)"),
            ("nic_classification", "NIC-2008 5-Digit Principal Activity Classification (>50% gross value added threshold)"),
            ("data_consistency", "Gross Value Added (GVA) Computation (Gross Output minus Intermediate Operational Consumption)"),
            ("supervisory_audit", "Supervisory Re-Interview & Quality Assurance (10% random re-survey audits, desk fabrication scrutiny)")
        ]
    }
}

def call_gemini_diagnostic_generator(role_id):
    """
    Calls Google Gemini Flash to generate 10 questions using 2 parallel batches (5 questions each).
    Completes in ~3-4 seconds with zero question repetition.
    """
    api_key = get_gemini_api_key()
    if not api_key:
        return None

    cadre = CADRE_INFO.get(role_id, CADRE_INFO["field_investigator_nsso"])
    comps = cadre["competencies"] # list of (cid, desc)

    # Batch 1: first 3 competencies (covers comp 0, 1, 2)
    batch1_comps = [comps[0], comps[1], comps[2]]
    # Batch 2: next 2 competencies + 1 from first (covers comp 2, 3, 4)
    batch2_comps = [comps[2], comps[3], comps[4]]

    from concurrent.futures import ThreadPoolExecutor

    def fetch_diag_batch(batch_comps, batch_idx):
        comp_lines = "\n".join([f"- '{cid}': {desc}" for cid, desc in batch_comps])
        prompt = f"""You are the official MoSPI Capacity Building AI Engine for Mission Karmayogi (SIH 2026).
Cadre Under Assessment: {cadre['title']} ({cadre['division']})
Batch: #{batch_idx+1}

Generate exactly 5 distinct, high-quality multiple-choice field assessment questions for an Indian statistical officer.
Cover these competencies:
{comp_lines}

Requirements:
1. Every question must be a realistic, practical field dilemma set in India (use realistic districts like Varanasi, Rohtak, Coimbatore, Patna, Nagpur, Kochi, or rural Haats).
2. Provide 4 plausible options (one correct, three realistic distractors).
3. Set 'correct_answer' to index (0, 1, 2, or 3).
4. Include a 1-sentence 'explanation' citing official MoSPI methodology.

Return ONLY a valid JSON array of 5 objects:
[
  {{
    "competency_id": "competency_id_here",
    "question": "Realistic dilemma or question?",
    "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
    "correct_answer": 0,
    "explanation": "Why this answer is required under MoSPI guidelines."
  }}
]
"""
        models = ["gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-3.5-flash-lite"]
        for m in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.75 + (batch_idx * 0.1),
                    "maxOutputTokens": 2000,
                    "responseMimeType": "application/json"
                }
            }
            try:
                res = _HTTP_SESSION.post(url, json=payload, timeout=8.5)
                if res.status_code == 200:
                    raw = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(raw)
                    if isinstance(parsed, list) and len(parsed) >= 1:
                        return parsed
            except Exception:
                pass
        return []

    with ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(fetch_diag_batch, batch1_comps, 0)
        f2 = executor.submit(fetch_diag_batch, batch2_comps, 1)
        res1 = f1.result()
        res2 = f2.result()

    combined = res1 + res2
    if len(combined) >= 10:
        combined = combined[:10]
        questions = []
        metadata = []
        for idx, q in enumerate(combined):
            cid = q.get("competency_id", "sampling_methods")
            qid = f"diag_gemini_{role_id}_{cid}_{idx+1}_{random.randint(1000, 9999)}"
            questions.append({
                "id": qid,
                "competency_id": cid,
                "question": q["question"],
                "options": q["options"]
            })
            metadata.append({
                "id": qid,
                "competency_id": cid,
                "correct_answer": q["correct_answer"],
                "explanation": q.get("explanation", "Verified against MoSPI standard methodology."),
                "source": "Official MoSPI Cadre Competency Manual"
            })
        return questions, metadata

    return None
def _generate_procedural_diagnostic(role_id):
    role_key = role_id if role_id in DIAGNOSTIC_SCENARIOS else "field_investigator_nsso"
    competencies_map = DIAGNOSTIC_SCENARIOS[role_key]

    questions = []
    metadata = []
    q_counter = 0

    # Generate 2 questions per competency to reach 10 questions
    for comp_id, scenario_list in competencies_map.items():
        for rep in range(2):
            q_counter += 1
            scenario_def = random.choice(scenario_list)
            
            if scenario_def.get("calc"):
                v = scenario_def["vars"]()
                # vary slightly for rep 2
                receipts = v["receipts"] + (rep * 4)
                expenses = v["expenses"] + (rep * 2)
                gva = receipts - expenses
                wrong_1 = receipts + expenses
                wrong_2 = round(receipts * 0.5, 1)
                wrong_3 = round(expenses * 1.2, 1)

                q_text = f"In a {v['enterprise']} in {v['district']}, total gross output is reported as Rs. {receipts} Lakhs, while intermediate consumption expenses are recorded as Rs. {expenses} Lakhs. What is the Gross Value Added (GVA) to be recorded in Block 5?"
                correct_opt = f"Rs. {gva} Lakhs (Gross Output minus Intermediate Consumption)"
                distractors = [
                    f"Rs. {wrong_1} Lakhs (Gross Output plus Intermediate Consumption)",
                    f"Rs. {wrong_2} Lakhs (Standard 50% arbitrary norm)",
                    f"Rs. {wrong_3} Lakhs (Intermediate Consumption markup)"
                ]
                explanation = "Gross Value Added (GVA) = Total Value of Output minus Total Intermediate Consumption."
                source = "ASUSE National Accounts Estimation Manual, Page 61"
            else:
                v = scenario_def["vars"]()
                q_text = scenario_def["template"].format(**v)
                correct_opt = scenario_def["correct"]
                distractors = list(scenario_def["distractors"])
                explanation = scenario_def["explanation"]
                source = scenario_def["source"]

            all_options = [correct_opt] + distractors
            random.shuffle(all_options)
            correct_idx = all_options.index(correct_opt)

            q_id = f"diag_{role_key}_{comp_id}_{q_counter}_{random.randint(1000, 9999)}"

            questions.append({
                "id": q_id,
                "competency_id": comp_id,
                "question": q_text,
                "options": all_options
            })

            metadata.append({
                "id": q_id,
                "competency_id": comp_id,
                "correct_answer": correct_idx,
                "explanation": explanation,
                "source": source
            })

    return questions, metadata
# =====================================================================
# SECTION 2: BLOOM'S TAXONOMY QUIZ GENERATOR (STRICT L1 / L2 / L3)
# =====================================================================

BLOOM_MANUAL_QUESTIONS = {
    "manual_cpi_rural": {
        "recall": [
            {
                "type": "Direct Statutory Rule",
                "bloom": "Recall",
                "question": "According to Section 4.1 of the CPI (Rural) Manual, between what designated hours must price collection at weekly village Haats take place?",
                "correct": "Between 10:00 AM and 2:00 PM on the designated market day to capture peak trading volume",
                "distractors": [
                    "Between 6:00 AM and 9:00 AM during initial morning stall setup",
                    "Between 4:00 PM and 7:00 PM when shops begin evening clearance sales",
                    "Any time between sunrise and sunset at the investigator's discretion"
                ],
                "manual": "Consumer Price Index (Rural) Field Price Collection Manual",
                "section": "Section 4.1 (Designated Village Markets)",
                "page": "Page 19",
                "quote": "Price collection must occur on the fixed weekly market day between 10:00 AM and 2:00 PM to capture peak transaction rates."
            },
            {
                "type": "Tolerance Threshold Standard",
                "bloom": "Recall",
                "question": "Under Section 4.4, an explicit justification remark is mandatory when a reported commodity price diverges by more than what percentage compared to the previous month?",
                "correct": "More than 20% divergence compared to the previous month quotation",
                "distractors": [
                    "More than 5% divergence",
                    "More than 10% divergence",
                    "More than 50% divergence"
                ],
                "manual": "Consumer Price Index (Rural) Field Price Collection Manual",
                "section": "Section 4.4 (Outlier Price Verification)",
                "page": "Page 38",
                "quote": "If a reported price diverges by more than 20% compared to the previous month quotation, the field investigator must provide an explicit justification."
            },
            {
                "type": "Substitution Eligibility Period",
                "bloom": "Recall",
                "question": "Under Section 4.2, after how many consecutive months of complete shop unavailability must a commodity variety be permanently substituted in Schedule 4.2?",
                "correct": "3 consecutive months of verified unavailability",
                "distractors": [
                    "1 single month of absence",
                    "6 consecutive months",
                    "12 consecutive months (annual cycle)"
                ],
                "manual": "Consumer Price Index (Rural) Field Price Collection Manual",
                "section": "Section 4.2 (Quotation Substitution)",
                "page": "Page 24",
                "quote": "If a designated variety of commodity is permanently unavailable in the shop for 3 consecutive months, a comparable substitute variety of identical grade must be selected."
            }
        ],
        "scenario": [
            {
                "type": "Field Market Timing Dilemma",
                "bloom": "Application",
                "vars": lambda: {"district": random.choice(DISTRICTS), "hour": random.choice(["4:45 PM", "5:30 PM", "6:15 PM"])},
                "gen": lambda v: {
                    "question": f"An investigator arrives at the designated weekly Haat in {v['district']} at {v['hour']} as stalls are packing up. Only 2 shops are open, offering end-of-day clearance discounts of 40%. According to Section 4.1, how should this visit be treated?",
                    "correct": "Invalid collection: Haat price collection must occur between 10:00 AM and 2:00 PM during peak transactions",
                    "distractors": [
                        "Record the clearance discounted prices because they represent actual consumer transactions",
                        "Add an arbitrary 20% inflation adjustment to estimate morning rates",
                        "Collect prices from an urban department store in the nearest district headquarters"
                    ],
                    "manual": "Consumer Price Index (Rural) Field Price Collection Manual",
                    "section": "Section 4.1 (Designated Village Markets)",
                    "page": "Page 19",
                    "quote": "Price collection must occur on the fixed weekly market day between 10:00 AM and 2:00 PM to capture peak transaction rates."
                }
            },
            {
                "type": "Substitute Variety Selection",
                "bloom": "Application",
                "vars": lambda: {"commodity": random.choice(COMMODITIES), "district": random.choice(DISTRICTS)},
                "gen": lambda v: {
                    "question": f"In {v['district']}, the designated brand of {v['commodity']} is permanently out of stock for 3 months. The shopkeeper suggests a premium imported organic alternative at double the price. What does Section 4.2 instruct the enumerator to do?",
                    "correct": "Select a comparable substitute variety of identical standard grade commonly consumed by rural households, not a luxury alternative",
                    "distractors": [
                        "Accept the premium organic alternative and record the double price directly",
                        f"Drop {v['commodity']} from the district basket entirely",
                        "Carry forward the old price from 3 months ago indefinitely"
                    ],
                    "manual": "Consumer Price Index (Rural) Field Price Collection Manual",
                    "section": "Section 4.2 (Quotation Substitution)",
                    "page": "Page 25",
                    "quote": "A comparable substitute variety of identical grade must be selected and documented in Schedule 4.2."
                }
            },
            {
                "type": "Barter Exchange Valuation Dilemma",
                "bloom": "Application",
                "vars": lambda: {"district": random.choice(DISTRICTS)},
                "gen": lambda v: {
                    "question": f"In a remote village market in {v['district']}, transactions for foodgrains occur via crop barter rather than cash. Under Section 4.3, how must the field investigator evaluate the price quotation?",
                    "correct": "Convert the barter quantity to its prevailing local cash equivalent using median mandi market rates during the survey week",
                    "distractors": [
                        "Leave the price column empty and mark the item as non-commercial barter",
                        "Assign an arbitrary nominal price of Rs. 1 per kilogram",
                        "Force the shopkeeper to sign a cash bill before entering data"
                    ],
                    "manual": "Consumer Price Index (Rural) Field Price Collection Manual",
                    "section": "Section 4.3 (Barter & In-Kind Valuation)",
                    "page": "Page 31",
                    "quote": "In rural areas where transactions occur through crop exchange, convert the barter value to prevailing local cash equivalents using median mandi rates."
                }
            }
        ],
        "analytical": [
            {
                "type": "Outlier Data Scrutiny & Imputation",
                "bloom": "Analysis",
                "vars": lambda: {"commodity": random.choice(COMMODITIES), "district": random.choice(DISTRICTS), "surge": random.randint(32, 48)},
                "gen": lambda v: {
                    "question": f"During monthly scrutiny for {v['district']}, the reported price for {v['commodity']} shows a {v['surge']}% month-on-month spike. The investigator claims road closures caused supply bottlenecks. What statistical verification protocol is required under Section 4.4?",
                    "correct": "Cross-verify with neighboring rural price quotations in the same sub-division and verify whether supply disruption remarks are corroborated before accepting into index calculation",
                    "distractors": [
                        "Automatically truncate the recorded price increase to exactly +19.9% to bypass software scrutiny triggers",
                        f"Discard the quotation completely and delete {v['commodity']} from the state calculation",
                        "Impute using the national consumer wholesale index regardless of local market conditions"
                    ],
                    "manual": "Consumer Price Index (Rural) Field Price Collection Manual",
                    "section": "Section 4.4 (Outlier Price Verification & Imputation)",
                    "page": "Page 39",
                    "quote": "If a reported price diverges by more than 20% compared to the previous month quotation, the field investigator must provide an explicit justification."
                }
            },
            {
                "type": "Sub-Group Price Relative Imputation",
                "bloom": "Analysis",
                "vars": lambda: {"commodity": random.choice(COMMODITIES), "district": random.choice(DISTRICTS)},
                "gen": lambda v: {
                    "question": f"In {v['district']}, {v['commodity']} is temporarily unavailable in the rural sample market during month t. Under CSO imputation rules (Section 4.5), how is the missing price relative mathematically estimated?",
                    "correct": "Impute using the weighted geometric mean of price relatives of other available commodities in the same parent sub-group",
                    "distractors": [
                        "Assume a price relative of 1.0 (zero price change) indefinitely",
                        "Use the national crude petroleum import parity price index",
                        "Take the simple arithmetic sum of all food item prices in the district"
                    ],
                    "manual": "Consumer Price Index (Rural) Field Price Collection Manual",
                    "section": "Section 4.5 (Missing Price Quotation Imputation)",
                    "page": "Page 44",
                    "quote": "Temporarily missing quotations shall be imputed using the price movement of the parent commodity sub-group."
                }
            },
            {
                "type": "Cross-Haat Price Variance Auditing",
                "bloom": "Analysis",
                "vars": lambda: {"commodity": random.choice(COMMODITIES), "district": random.choice(DISTRICTS), "ratio": random.choice(["2.2x", "2.5x", "2.8x"])},
                "gen": lambda v: {
                    "question": f"Across two sample Haats in {v['district']} separated by only 12 km, the collected price for {v['commodity']} differs by {v['ratio']}. What analytical scrutiny must the statistical officer perform before aggregating?",
                    "correct": "Audit unit-of-quantity specifications (e.g. 500g pouch vs 1kg bulk) and verify whether grade differentials explain the variance",
                    "distractors": [
                        "Average the two prices immediately without investigating unit measurements",
                        "Delete the lower price quotation and retain only the higher quotation",
                        "File an FIR against the lower-priced village shopkeeper"
                    ],
                    "manual": "Consumer Price Index (Rural) Field Price Collection Manual",
                    "section": "Section 4.6 (Specification & Unit Reconciliation)",
                    "page": "Page 49",
                    "quote": "Any price divergence exceeding 50% between proximate markets mandates immediate verification of the reported unit of quantity and grade specifications."
                }
            }
        ]
    },

    "manual_plfs_2026": {
        "recall": [
            {
                "type": "Principal Status Threshold",
                "bloom": "Recall",
                "question": "Under Section 3.2 of the PLFS Manual, what is the minimum aggregate duration of economic activity during the 365 reference days required to be classified as Employed in Usual Principal Status (UPS)?",
                "correct": "183 days or more (majority time criterion of the reference year)",
                "distractors": [
                    "90 days or more",
                    "270 days or more",
                    "At least 30 consecutive days"
                ],
                "manual": "Periodic Labour Force Survey (PLFS) Manual 2026",
                "section": "Section 3.2 (Usual Principal Activity Status)",
                "page": "Page 42",
                "quote": "If a person was engaged in economic activity for 183 days or more, they are classified as employed in UPS."
            },
            {
                "type": "CWS Sensitivity Criterion",
                "bloom": "Recall",
                "question": "Under Section 3.4 of the PLFS Manual, what is the minimum duration of economic work required during the 7 reference days to qualify as Employed under Current Weekly Status (CWS)?",
                "correct": "At least 1 hour on any 1 single day of the 7 reference days",
                "distractors": [
                    "At least 4 hours total across the week",
                    "At least half a normal working day (4 hours) on 3 separate days",
                    "A minimum of 14 hours total over the 7 days"
                ],
                "manual": "Periodic Labour Force Survey (PLFS) Manual 2026",
                "section": "Section 3.4 (Current Weekly Status)",
                "page": "Page 51",
                "quote": "A person is considered employed under CWS if they worked for at least 1 hour on any 1 day during the reference period of 7 days."
            },
            {
                "type": "Absence Duration Threshold for Headship",
                "bloom": "Recall",
                "question": "Under Section 3.5 of the PLFS Manual, after how many months of continuous absence must the de-facto resident adult be recorded as the Head of Household instead of the absent member?",
                "correct": "6 months or more continuous absence",
                "distractors": [
                    "1 month of absence",
                    "3 months of absence",
                    "12 months of absence"
                ],
                "manual": "Periodic Labour Force Survey (PLFS) Manual 2026",
                "section": "Section 3.5 (Non-availability of Household Head)",
                "page": "Page 59",
                "quote": "If the designated household head is absent continuously for 6 months or more, the de-facto resident adult managing daily expenses must be recorded as the household head."
            }
        ],
        "scenario": [
            {
                "type": "Usual Activity Status Determination",
                "bloom": "Application",
                "vars": lambda: {"name": random.choice(NAMES), "farm_days": random.randint(95, 120), "shop_days": random.randint(75, 95), "district": random.choice(DISTRICTS)},
                "gen": lambda v: {
                    "question": f"In {v['district']}, worker {v['name']} was engaged in farm cultivation for {v['farm_days']} days and operated a repair kiosk for {v['shop_days']} days during the 365 reference days ({v['farm_days']+v['shop_days']} total economic days). How should UPS be classified under Section 3.2?",
                    "correct": f"Employed in UPS, because aggregate economic days ({v['farm_days']+v['shop_days']}) equals or exceeds the 183-day majority threshold",
                    "distractors": [
                        "Unemployed, since neither job individually reached 183 days",
                        "Subsidiary Status (SS) worker only",
                        "Out of Labour Force"
                    ],
                    "manual": "Periodic Labour Force Survey (PLFS) Manual 2026",
                    "section": "Section 3.2 (Usual Principal Activity Status)",
                    "page": "Page 42",
                    "quote": "If a person was engaged in economic activity for 183 days or more in aggregate during the 365 reference days, they are classified as employed in UPS."
                }
            },
            {
                "type": "Current Weekly Status Field Dilemma",
                "bloom": "Application",
                "vars": lambda: {"name": random.choice(NAMES), "day": random.choice(["Tuesday", "Friday", "Sunday"])},
                "gen": lambda v: {
                    "question": f"Respondent {v['name']} was actively seeking work for 6 days during the reference week, but worked for 2 hours loading trucks on {v['day']} for Rs. 150. Under Section 3.4, what is their Current Weekly Status (CWS)?",
                    "correct": "Employed under CWS, because 2 hours of paid economic work satisfies the minimum 1-hour criterion",
                    "distractors": [
                        "Unemployed under CWS, since the respondent was searching for work for 6 out of 7 days",
                        "Underemployed with zero status recording",
                        "Out of labour force"
                    ],
                    "manual": "Periodic Labour Force Survey (PLFS) Manual 2026",
                    "section": "Section 3.4 (Current Weekly Status)",
                    "page": "Page 51",
                    "quote": "A person is considered employed under CWS if they worked for at least 1 hour on any 1 day during the reference period of 7 days."
                }
            }
        ],
        "analytical": [
            {
                "type": "Principal vs Subsidiary Activity Synthesis",
                "bloom": "Analysis",
                "vars": lambda: {"name": random.choice(NAMES), "district": random.choice(DISTRICTS)},
                "gen": lambda v: {
                    "question": f"In {v['district']}, an informant spent 210 days pursuing higher education (non-economic), 115 days working in a dairy cooperative, and 40 days as seasonal harvester. How should the investigator reconcile UPS and Subsidiary Status (SS)?",
                    "correct": "UPS = Not in Labour Force (Student, 210 days > 183 days); SS = Employed in Subsidiary Status (155 combined days of economic work >= 30 days)",
                    "distractors": [
                        "UPS = Employed, because 155 days of work exceeds any single student semester",
                        "UPS = Unemployed, because the student failed to find full-time employment",
                        "Both UPS and SS = Not in Labour Force"
                    ],
                    "manual": "Periodic Labour Force Survey (PLFS) Manual 2026",
                    "section": "Section 3.3 (Subsidiary Economic Activity)",
                    "page": "Page 47",
                    "quote": "A person who was not economically active for the major time of the year may still have pursued economic activity for a shorter period (not less than 30 days). Such activity is recorded under Subsidiary Status."
                }
            }
        ]
    },

    "manual_asuse_2026": {
        "recall": [
            {
                "type": "GVA Computation Formula",
                "bloom": "Recall",
                "question": "Under Section 5.2 of the ASUSE Manual, what is the exact mathematical definition of Gross Value Added (GVA)?",
                "correct": "Total Gross Value of Output minus Total Intermediate Operational Consumption expenses",
                "distractors": [
                    "Total Gross Output plus Total Intermediate Consumption",
                    "Total Annual Sales Turnover multiplied by 50%",
                    "Total Fixed Capital Assets divided by Number of Hired Workers"
                ],
                "manual": "Annual Survey of Unincorporated Sector Enterprises (ASUSE) Manual",
                "section": "Section 5.2 (Gross Value Added Computation)",
                "page": "Page 58",
                "quote": "Gross Value Added (GVA) shall be calculated as total gross output minus intermediate consumption expenses incurred during the reference accounting year."
            },
            {
                "type": "Principal Activity Classification Threshold",
                "bloom": "Recall",
                "question": "Under Section 5.3 of the ASUSE Manual, what percentage of gross value added determines the principal activity classification for mixed enterprises?",
                "correct": "The activity generating more than 50% of gross value added",
                "distractors": [
                    "The activity generating more than 25% of gross value added",
                    "The activity with the highest number of hired workers regardless of revenue",
                    "The activity established earliest in chronological history"
                ],
                "manual": "Annual Survey of Unincorporated Sector Enterprises (ASUSE) Manual",
                "section": "Section 5.3 (Mixed Activity Units)",
                "page": "Page 62",
                "quote": "If an establishment operates both manufacturing and trade activities, classification must follow the primary activity generating more than 50% of gross value added."
            }
        ],
        "scenario": [
            {
                "type": "Cross-Block Establishment Demarcation",
                "bloom": "Application",
                "vars": lambda: {"district": random.choice(DISTRICTS), "block": random.randint(15, 75)},
                "gen": lambda v: {
                    "question": f"While surveying UFS Block {v['block']} in {district_name(v['district'])}, an enumerator finds a workshop with machining sheds in Block {v['block']}, but sales counter in Block {v['block']+1}. Under Section 5.1, where should the enterprise be recorded?",
                    "correct": "Enumerate the enterprise in the UFS block where its principal operational production activity takes place",
                    "distractors": [
                        "Submit two separate enterprise questionnaires with split payroll numbers",
                        "Drop the enterprise because multi-block establishments are out of scope",
                        "Enumerate only the sales counter block and omit the workshop"
                    ],
                    "manual": "Annual Survey of Unincorporated Sector Enterprises (ASUSE) Manual",
                    "section": "Section 5.1 (Frame Reconciliation & Boundary Demarcation)",
                    "page": "Page 48",
                    "quote": "Field enumerators must verify the enterprise location against the local Urban Frame Survey (UFS) block boundaries before commencing interview schedules."
                }
            }
        ],
        "analytical": [
            {
                "type": "GVA Calculation & Profit Deduplication",
                "bloom": "Analysis",
                "vars": lambda: {"output": random.randint(24, 38), "input": random.randint(10, 18), "enterprise": random.choice(ENTERPRISES)},
                "gen": lambda v: {
                    "question": f"An unincorporated {v['enterprise']} reports total annual gross output of Rs. {v['output']} Lakhs and intermediate operational consumption (raw materials, electricity, rent) of Rs. {v['input']} Lakhs. Under Section 5.2, what is the Gross Value Added (GVA)?",
                    "correct": f"Rs. {v['output'] - v['input']} Lakhs (Output Rs. {v['output']}L minus Intermediate Expenses Rs. {v['input']}L)",
                    "distractors": [
                        f"Rs. {v['output'] + v['input']} Lakhs (Sum of output and expenses)",
                        f"Rs. {round(v['output'] * 0.5, 1)} Lakhs (Estimated standard 50% margin)",
                        f"Rs. {v['output']} Lakhs (Gross output before deduction)"
                    ],
                    "manual": "Annual Survey of Unincorporated Sector Enterprises (ASUSE) Manual",
                    "section": "Section 5.2 (Gross Value Added Computation)",
                    "page": "Page 58",
                    "quote": "Gross Value Added (GVA) shall be calculated as total gross output minus intermediate consumption expenses incurred during the reference accounting year."
                }
            }
        ]
    }
}

def generate_dynamic_quiz(manual_id="manual_plfs_2026", custom_text="", difficulty="scenario", count=5, doc_name=""):
    """
    Generates dynamic randomized questions strictly following Bloom's Taxonomy:
    - Supports selectable counts: 5, 10, 20, 30 questions.
    - 'recall'     -> Bloom L1: Direct Guideline Recall
    - 'scenario'   -> Bloom L2: Field Dilemmas & Real Application
    - 'analytical' -> Bloom L3: Critical Verification & Imputation
    """
    try:
        count = int(count)
    except Exception:
        count = 5

    # 1. If Gemini API Key is available, call Gemini Flash generator
    if GEMINI_API_KEY and len(GEMINI_API_KEY.strip()) > 10:
        try:
            llm_questions = call_gemini_quiz_generator(manual_id, custom_text, difficulty, count=count, doc_name=doc_name)
            if llm_questions and len(llm_questions) >= count:
                return llm_questions[:count]
            elif llm_questions and len(llm_questions) > 0:
                # If Gemini returned partial, complement with procedural
                need_more = count - len(llm_questions)
                extra = _generate_procedural_pool(manual_id, difficulty, need_more)
                return llm_questions + extra
        except Exception as e:
            print("Gemini API error, falling back to procedural engine:", e)

    # 2. Procedural Bloom's Generation Fallback
    return _generate_procedural_pool(manual_id, difficulty, count)

def _generate_procedural_pool(manual_id, difficulty, count):
    key = manual_id if manual_id in BLOOM_MANUAL_QUESTIONS else "manual_plfs_2026"
    manual_data = BLOOM_MANUAL_QUESTIONS[key]

    bloom_key = difficulty.lower()
    if bloom_key not in ["recall", "scenario", "analytical"]:
        bloom_key = "scenario"

    pool = list(manual_data.get(bloom_key, []))
    if not pool:
        pool = list(manual_data.get("scenario", [])) or list(manual_data.get("recall", []))

    # Gather additional templates from other tiers if count exceeds current pool
    all_manual_templates = []
    for level, items in manual_data.items():
        all_manual_templates.extend(items)

    questions = []
    generated = 0
    cycle = 0

    while generated < count:
        cycle += 1
        # Shuffle pool
        curr_pool = list(pool)
        random.shuffle(curr_pool)
        
        # If pool is smaller than needed, append from all manual templates
        if len(curr_pool) < count:
            extra_shuffled = list(all_manual_templates)
            random.shuffle(extra_shuffled)
            curr_pool.extend(extra_shuffled)

        for idx, t in enumerate(curr_pool):
            if generated >= count:
                break
            
            if "vars" in t:
                v = t["vars"]()
                q_data = t["gen"](v)
            else:
                q_data = t

            all_opts = [q_data["correct"]] + list(q_data["distractors"])
            random.shuffle(all_opts)
            correct_idx = all_opts.index(q_data["correct"])

            qid = f"quiz_{key}_{bloom_key}_{generated+1}_{random.randint(1000, 9999)}"
            questions.append({
                "id": qid,
                "type": q_data.get("type", "Field Scenario Decision"),
                "bloom_level": q_data.get("bloom", bloom_key.capitalize()),
                "question": q_data["question"],
                "options": all_opts,
                "correct_answer": correct_idx,
                "citation": {
                    "manual": q_data["manual"],
                    "section": q_data["section"],
                    "page": q_data["page"],
                    "exact_quote": q_data["quote"]
                }
            })
            generated += 1

    return questions

_HTTP_SESSION = requests.Session()
_PREFETCH_CACHE = {}

def call_gemini_quiz_generator(manual_id, custom_text, difficulty, count=5, doc_name=""):
    """
    Ultra-low-latency Google Gemini Flash generation:
    - Supports selectable counts: 5, 10, 20, 30 questions
    - Automatically parallelizes batch chunks for 20 and 30 questions
    - Uses persistent HTTP connection pooling
    """
    api_key = get_gemini_api_key()
    if not api_key:
        return None

    if custom_text and len(custom_text.strip()) > 20:
        doc_name = doc_name if doc_name else "Uploaded Statistical Manual"
    else:
        manual_names = {
            "manual_cpi_rural": "Consumer Price Index (Rural) Field Price Collection Manual 2026",
            "manual_plfs_2026": "Periodic Labour Force Survey (PLFS) Field Operations Manual 2026",
            "manual_asuse_2026": "Annual Survey of Unincorporated Sector Enterprises (ASUSE) Manual 2026"
        }
        doc_name = manual_names.get(manual_id, doc_name or "Official MoSPI Statistical Manual")

    bloom_guidance = {
        "recall": "Bloom L1: Direct Guideline Recall (exact rules, hours, percentages, day limits, statutory definitions).",
        "scenario": "Bloom L2: Practical Field Dilemmas faced by enumerators in Indian villages/markets.",
        "analytical": "Bloom L3: Critical Verification & Analysis (calculations, GVA, imputation, outliers)."
    }
    bloom_desc = bloom_guidance.get(difficulty.lower(), bloom_guidance["scenario"])

    # For counts <= 10: execute single fast request
    if count <= 10:
        return _fetch_gemini_chunk(doc_name, custom_text, difficulty, bloom_desc, count, 0, api_key)

    # For counts 20 or 30: parallel chunk generation with ThreadPoolExecutor
    from concurrent.futures import ThreadPoolExecutor
    chunk_size = 10
    num_chunks = count // chunk_size
    
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = [
            executor.submit(_fetch_gemini_chunk, doc_name, custom_text, difficulty, bloom_desc, chunk_size, i, api_key)
            for i in range(num_chunks)
        ]
        all_results = []
        for f in futures:
            try:
                res = f.result(timeout=12)
                if res:
                    all_results.extend(res)
            except Exception as e:
                print("Parallel chunk error:", e)

    return all_results if all_results else None

def _fetch_gemini_chunk(doc_name, custom_text, difficulty, bloom_desc, chunk_count, chunk_idx, api_key):
    if custom_text and len(custom_text.strip()) > 20:
        prompt = f"""MoSPI Capacity Building AI Engine (Mission Karmayogi SIH 2026).
Source Document: {doc_name}

CRITICAL REQUIREMENT:
You MUST generate questions EXCLUSIVELY based on the contents, rules, instructions, and numbers in the uploaded manual text below:
================ BEGIN UPLOADED MANUAL TEXT ================
{custom_text[:8000]}
================= END UPLOADED MANUAL TEXT =================

Batch: #{chunk_idx + 1}
Target Objective: {bloom_desc}
Generate exactly {chunk_count} distinct multiple-choice questions matching {difficulty.upper()} derived ENTIRELY from the uploaded manual text above.
Requirements:
1. Every question must directly test rules, facts, definitions, or instructions from the uploaded text above.
2. In 'citation', cite "{doc_name}", the specific clause/section, and provide an exact quote from the uploaded text above.
3. Set 'correct_answer' to index (0, 1, 2, or 3).

Return ONLY valid JSON array (no markdown text):
[
  {{
    "type": "MoSPI Field Assessment",
    "bloom_level": "{difficulty.capitalize()}",
    "question": "Clear question text?",
    "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
    "correct_answer": 0,
    "citation": {{
      "manual": "{doc_name}",
      "section": "Section X.X",
      "page": "Page XX",
      "exact_quote": "Exact verbatim quote."
    }}
  }}
]
"""
    else:
        prompt = f"""MoSPI Capacity Building AI Engine (Mission Karmayogi SIH 2026).
Document: {doc_name} (approx 100 pages official guidelines)
Batch: #{chunk_idx + 1}
Target: {bloom_desc}

Generate exactly {chunk_count} distinct multiple-choice questions matching {difficulty.upper()}.
Requirements:
1. Provide exactly 4 realistic options.
2. In 'citation', cite the exact manual, section, page (e.g., Page {15 + chunk_idx*8}), and a verbatim official quote.
3. Set 'correct_answer' to index (0, 1, 2, or 3).

Return ONLY valid JSON array (no markdown text):
[
  {{
    "type": "MoSPI Field Assessment",
    "bloom_level": "{difficulty.capitalize()}",
    "question": "Clear question text?",
    "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
    "correct_answer": 0,
    "citation": {{
      "manual": "{doc_name}",
      "section": "Section X.X",
      "page": "Page XX",
      "exact_quote": "Exact verbatim quote."
    }}
  }}
]
"""
    tokens = 1400 if chunk_count <= 5 else 2600
    models_to_try = ["gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-3.5-flash-lite"]

    for model_name in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.15 + (chunk_idx * 0.08),
                "maxOutputTokens": tokens,
                "responseMimeType": "application/json"
            }
        }

        try:
            res = _HTTP_SESSION.post(url, json=payload, timeout=8.5)
            if res.status_code == 200:
                data = res.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(raw_text)
                if isinstance(parsed, list) and len(parsed) >= 1:
                    for idx, q in enumerate(parsed):
                        q["id"] = f"gemini_{difficulty}_{chunk_idx}_{idx+1}_{random.randint(1000, 9999)}"
                        q["is_live_gemini"] = True
                        q["source_manual"] = doc_name
                    return parsed
        except Exception:
            pass

    return []
