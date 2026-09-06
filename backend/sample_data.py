# Sample Data & MoSPI Knowledge Base for SankhyaSetu AI

MOSPI_ROLES = [
    {
        "id": "field_investigator_nsso",
        "title": "Field Investigator (NSSO)",
        "department": "National Sample Survey Office - Field Operations Division",
        "description": "Conducts household and enterprise visits, collects grassroots survey data using CAPI tablets, and verifies informant responses.",
        "competencies": [
            {"id": "sampling_methods", "name": "Survey Sampling & Unit Selection", "required_level": 4},
            {"id": "non_response_protocol", "name": "Handling Non-Response & Reluctant Informants", "required_level": 5},
            {"id": "capi_software", "name": "CAPI Digital Survey Entry & Validation", "required_level": 4},
            {"id": "data_consistency", "name": "Field Consistency Checks & Cross-Verification", "required_level": 4},
            {"id": "statistical_ethics", "name": "Official Statistics Confidentiality & Ethics", "required_level": 3}
        ]
    },
    {
        "id": "statistical_officer_cso",
        "title": "Junior Statistical Officer (CSO)",
        "department": "Central Statistics Office - National Accounts Division",
        "description": "Performs secondary data scrutiny, macro-aggregations, GDP/IIP index compilation, and outlier imputation.",
        "competencies": [
            {"id": "sampling_methods", "name": "Survey Sampling & Unit Selection", "required_level": 5},
            {"id": "data_consistency", "name": "Field Consistency Checks & Cross-Verification", "required_level": 5},
            {"id": "econometric_modeling", "name": "Econometric Modeling & Seasonal Adjustment", "required_level": 4},
            {"id": "r_python_analytics", "name": "Statistical Computing (R / Python / STATA)", "required_level": 4},
            {"id": "metadata_standards", "name": "National Data Sharing & Metadata Standards (NDSAP)", "required_level": 4}
        ]
    },
    {
        "id": "survey_supervisor_asuse",
        "title": "Survey Supervisor (ASUSE / Economic Census)",
        "department": "Annual Survey of Unincorporated Sector Enterprises",
        "description": "Supervises enumerator squads, conducts 10% sample re-surveys, and resolves enterprise classification ambiguities.",
        "competencies": [
            {"id": "sampling_methods", "name": "Survey Sampling & Unit Selection", "required_level": 4},
            {"id": "non_response_protocol", "name": "Handling Non-Response & Reluctant Informants", "required_level": 5},
            {"id": "nic_classification", "name": "National Industrial Classification (NIC-2008)", "required_level": 5},
            {"id": "data_consistency", "name": "Field Consistency Checks & Cross-Verification", "required_level": 5},
            {"id": "supervisory_audit", "name": "Sub-sample Inspection & Bias Auditing", "required_level": 4}
        ]
    }
]

DIAGNOSTIC_QUESTIONS = {
    "field_investigator_nsso": [
        {
            "id": "q1",
            "competency_id": "sampling_methods",
            "question": "In a rural NSS survey village, if the number of households exceeds 300, what is the mandatory protocol prescribed by MoSPI?",
            "options": [
                "Select every 3rd household using systematic sampling directly",
                "Divide the village into Hamlet-Groups (HGs) of approximately equal population and select two HGs randomly",
                "Survey only households located within 500m of the Gram Panchayat building",
                "Report the village as non-feasible and proceed to the reserve sample village"
            ],
            "correct_answer": 1,
            "explanation": "As per MoSPI NSS Survey Manual Section 2.3, when sample village population exceeds 1,200 or ~300 households, hamlet-group (HG) formation is mandatory to avoid coverage bias.",
            "source": "MoSPI NSS Survey Methodology Handbook, Page 14"
        },
        {
            "id": "q2",
            "competency_id": "non_response_protocol",
            "question": "A respondent household is found locked during the first visit. What is the official MoSPI field guideline for recording this outcome?",
            "options": [
                "Immediately substitute the household with the adjacent neighbor",
                "Mark as Temporarily Absent and schedule at least two revisits at different times before declaring non-response",
                "Delete the entry from the CAPI tablet and reduce the sample size",
                "Collect approximate expenditure estimates from the village Sarpanch"
            ],
            "correct_answer": 1,
            "explanation": "MoSPI Field Operations Guideline 4.1 forbids immediate substitution without at least 2 revisits at varying times of the day to minimize non-response bias.",
            "source": "NSSO Field Staff Instructions, Section 4.1, Page 31"
        },
        {
            "id": "q3",
            "competency_id": "capi_software",
            "question": "During CAPI tablet data entry for PLFS, what does a Hard Warning validation flag signify?",
            "options": [
                "The enumerator must enter a descriptive remark before proceeding to the next block",
                "The value entered is mathematically impossible or logically contradictory and must be corrected before proceeding",
                "The tablet battery is below 15% and cloud sync is paused",
                "The respondent is eligible for a government welfare incentive"
            ],
            "correct_answer": 1,
            "explanation": "CAPI Data Entry Manual specifies that Hard Errors represent logical contradictions (e.g., child age 3 recorded as salaried engineer) which lock submission until rectified.",
            "source": "MoSPI CAPI Systems Manual, Page 47"
        },
        {
            "id": "q4",
            "competency_id": "data_consistency",
            "question": "In the Consumer Expenditure Survey, if an informant reports monthly food expenditure of Rs. 4,500 but total household monthly consumption of Rs. 3,800, how should the enumerator resolve this?",
            "options": [
                "Accept the numbers as reported without questioning the informant",
                "Reconcile Block 5 (Food) with Block 8 (Total Summary) with the respondent to identify over-reporting or omissions",
                "Average the two numbers and record Rs. 4,150",
                "Discard the entire schedule and mark the household as uncooperative"
            ],
            "correct_answer": 1,
            "explanation": "Internal consistency across expenditure aggregates is a core audit check. Enumerators must probe gently to identify whether durable/non-food items were omitted.",
            "source": "Household Consumption Manual 2026, Page 78"
        },
        {
            "id": "q5",
            "competency_id": "statistical_ethics",
            "question": "Under the Collection of Statistics Act 2008, can a field investigator share individual household survey responses with local tax authorities?",
            "options": [
                "Yes, if requested in writing by the District Magistrate",
                "No, individual survey schedules are strictly confidential and protected by statutory immunity",
                "Yes, provided the respondent earns above the taxable threshold",
                "Only if the respondent gives verbal consent"
            ],
            "correct_answer": 1,
            "explanation": "Section 9 of the Collection of Statistics Act 2008 guarantees absolute confidentiality. MoSPI micro-data can never be used for taxation or punitive proceedings.",
            "source": "Collection of Statistics Act 2008, Section 9"
        }
    ]
}

IGOT_COURSES = [
    {
        "id": "igot_stat_101",
        "title": "Mastering Survey Sampling & Hamlet-Group Formations",
        "provider": "National Statistical Systems Training Academy (NSSTA)",
        "competency_id": "sampling_methods",
        "duration": "45 Mins (Micro-Module)",
        "rating": 4.9,
        "level": "Intermediate",
        "karmayogi_id": "KY-MOSPI-SMP-2026",
        "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
        "recommended_timestamps": [
            {"time_seconds": 125, "label": "02:05 - Hamlet Group Formation Criteria"},
            {"time_seconds": 340, "label": "05:40 - Systematic Random Sampling Rules"},
            {"time_seconds": 680, "label": "11:20 - Resolving Boundary Ambiguities"}
        ],
        "summary": "Covers practical field methods for dividing large villages into HGs, calculating sampling intervals, and avoiding selection bias."
    },
    {
        "id": "igot_stat_102",
        "title": "Non-Response Mitigation & Revisit Protocols",
        "provider": "LBSNAA & MoSPI Capacity Wing",
        "competency_id": "non_response_protocol",
        "duration": "30 Mins (Micro-Module)",
        "rating": 4.8,
        "level": "Foundational",
        "karmayogi_id": "KY-DOPT-NRM-102",
        "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
        "recommended_timestamps": [
            {"time_seconds": 90, "label": "01:30 - Defining Temporary vs. Permanent Absence"},
            {"time_seconds": 255, "label": "04:15 - Rapport Building with Reluctant Households"},
            {"time_seconds": 510, "label": "08:30 - Substitution Protocols (When Permitted)"}
        ],
        "summary": "Guidelines on rapport building, culturally sensitive interviewing, and mandatory revisit timing for locked households."
    },
    {
        "id": "igot_stat_103",
        "title": "CAPI Validation Rules, Hard Errors & Cloud Syncing",
        "provider": "Computer Centre, MoSPI",
        "competency_id": "capi_software",
        "duration": "35 Mins (Hands-on)",
        "rating": 4.7,
        "level": "Practical",
        "karmayogi_id": "KY-MOSPI-CAP-301",
        "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
        "recommended_timestamps": [
            {"time_seconds": 60, "label": "01:00 - Hard Errors vs. Soft Warnings"},
            {"time_seconds": 290, "label": "04:50 - Offline Cache Management"},
            {"time_seconds": 480, "label": "08:00 - End-of-Day Batch Verification"}
        ],
        "summary": "Technical walkthrough of the MoSPI CAPI Android application, schema constraints, and offline synchronization protocols."
    },
    {
        "id": "igot_stat_104",
        "title": "Cross-Validation & Field Scrutiny in Household Surveys",
        "provider": "Directorate of Economics & Statistics (DES)",
        "competency_id": "data_consistency",
        "duration": "40 Mins",
        "rating": 4.8,
        "level": "Advanced",
        "karmayogi_id": "KY-DES-CVD-404",
        "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
        "recommended_timestamps": [
            {"time_seconds": 150, "label": "02:30 - Inter-block Expenditure Consistency"},
            {"time_seconds": 420, "label": "07:00 - Detecting Enumerator Fatigue Patterns"},
            {"time_seconds": 610, "label": "10:10 - Imputation Flags Documentation"}
        ],
        "summary": "Methodology for spotting statistical anomalies and ensuring reported quantities match market pricing benchmarks."
    }
]

SAMPLE_MANUALS = [
    {
        "id": "manual_plfs_2026",
        "title": "Periodic Labour Force Survey (PLFS) Field Manual 2026",
        "pages": 142,
        "category": "Employment Statistics",
        "text_sample": """
Chapter 3: Concepts and Definitions in PLFS
3.1 Economic Activity: Any activity resulting in the production of goods and services that adds value to national product is considered economic activity.
3.2 Usual Principal Activity Status (UPS): The activity status on which a person spent relatively long time during the 365 days preceding the date of survey. If a person was engaged in economic activity for 183 days or more, they are classified as employed in UPS.
3.3 Subsidiary Economic Activity (SS): A person who was not economically active for the major time of the year may still have pursued some economic activity for a shorter period (not less than 30 days during the reference year). Such an activity is recorded under Subsidiary Status.
3.4 Current Weekly Status (CWS): Determines the activity status during the reference period of 7 days preceding the survey date. A person is considered employed under CWS if they worked for at least 1 hour on any 1 day during the 7 days.
3.5 Non-availability of Household Head: If the designated household head is absent continuously for 6 months or more, the de-facto resident adult managing daily expenses must be recorded as the household head for the purpose of the survey.
"""
    },
    {
        "id": "manual_cpi_rural",
        "title": "Consumer Price Index (Rural) Field Price Collection Manual",
        "pages": 88,
        "category": "Price Statistics",
        "text_sample": """
Section 4: Price Collection Protocols in Rural Markets
4.1 Designated Village Markets (Haats): Price collection must occur on the fixed weekly market day between 10:00 AM and 2:00 PM to capture peak transaction rates.
4.2 Quotation Substitution: If a designated variety of commodity is permanently unavailable in the shop for 3 consecutive months, a comparable substitute variety of identical grade must be selected and documented in Schedule 4.2.
4.3 Barter & In-Kind Valuation: In rural areas where transactions occur through crop exchange, convert the barter value to prevailing local cash equivalents using median mandi rates of the survey week.
4.4 Outlier Price Verification: If a reported price diverges by more than 20% compared to the previous month quotation, the field investigator must provide an explicit justification.
"""
    },
    {
        "id": "manual_asuse_2026",
        "title": "Annual Survey of Unincorporated Sector Enterprises (ASUSE) Manual",
        "pages": 112,
        "category": "Enterprise Statistics",
        "text_sample": """
Section 5: Enterprise Frame Auditing & GVA Valuation Protocols
5.1 Frame Reconciliation: Field enumerators must verify the enterprise location against the local Urban Frame Survey (UFS) block boundaries before commencing interview schedules.
5.2 Gross Value Added (GVA) Computation: GVA shall be calculated as total gross output minus intermediate consumption expenses incurred during the reference accounting year.
5.3 Mixed Activity Units: If an establishment operates both manufacturing and trade activities, classification must follow the primary activity generating more than 50% of gross value added.
5.4 Non-Response Weighting: Non-responding units must be flagged with mandatory supervisor sign-off and documented reasons (closed, relocated, refusal) in Block 9.
"""
    }
]
