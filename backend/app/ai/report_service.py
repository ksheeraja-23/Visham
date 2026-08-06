from sqlalchemy.orm import Session

from app.ai.client import client
from app.ai.prompts import SYSTEM_PROMPT
from app.ai.repository import AIRepository


class ReportService:

    def __init__(self):
        self.repository = AIRepository()

    def generate_report(
        self,
        db: Session,
        case_id: int
    ):

        data = self.repository.get_case_context(
            db,
            case_id
        )

        if data is None:
            return "Case not found."

        case = data["case"]

        prompt = f"""
{SYSTEM_PROMPT}

You are an experienced criminal investigation officer.

Generate a professional investigation report.

Use the following structure:

1. Executive Summary

2. Case Overview

3. Evidence Analysis

4. Suspect Analysis

5. Witness Analysis

6. Timeline Reconstruction

7. Key Observations

8. Recommended Next Steps

CASE

Case Number:
{case.case_number}

Title:
{case.title}

Description:
{case.description}

Status:
{case.status}

Priority:
{case.priority}

Location:
{case.location}

EVIDENCE
"""

        for evidence in data["evidence"]:

            prompt += f"""

Title:
{evidence.title}

Type:
{evidence.evidence_type}

Description:
{evidence.description}
"""

        prompt += "\nSUSPECTS\n"

        for suspect in data["suspects"]:

            prompt += f"""

Name:
{suspect.full_name}

Alias:
{suspect.alias}

Risk:
{suspect.risk_level}

Status:
{suspect.status}

Notes:
{suspect.notes}
"""

        prompt += "\nWITNESSES\n"

        for witness in data["witnesses"]:

            prompt += f"""

Name:
{witness.full_name}

Credibility:
{witness.credibility}

Statement:
{witness.statement}
"""

        prompt += "\nTIMELINE\n"

        for event in data["timeline"]:

            prompt += f"""

{event.event_time}

{event.title}

{event.description}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return response.text