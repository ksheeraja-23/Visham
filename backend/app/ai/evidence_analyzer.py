import json

from app.ai.client import client


class EvidenceAnalyzer:

    def analyze(
        self,
        title: str,
        description: str,
        evidence_type: str
    ):

        prompt = f"""
You are an experienced digital forensic investigator.

Analyze the following evidence.

Title:
{title}

Description:
{description}

Evidence Type:
{evidence_type}

Return ONLY valid JSON in this exact format.

{{
    "summary":"",
    "keywords":[],
    "entities":[],
    "category":"",
    "notes":""
}}

Rules:
- keywords must be an array.
- entities must be an array.
- notes should contain investigative observations.
- Do not include markdown.
- Do not include explanations.
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return json.loads(response.text)