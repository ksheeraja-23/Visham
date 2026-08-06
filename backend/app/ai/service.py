from sqlalchemy.orm import Session
from app.ai.client import client
from app.ai.prompts import SYSTEM_PROMPT
from app.ai.repository import AIRepository

class AIService:

    def __init__(self):
        self.repository = AIRepository()

    def chat(
        self,
        question: str
    ):
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{SYSTEM_PROMPT}\n\nUser Question:\n{question}"
        )
        return response.text

    def _prepare_context(self, data) -> str:
        case = data["case"]
        prompt = f"""
CASE
Case Number: {case.case_number}
Title: {case.title}
Description: {case.description}
Status: {case.status}
Priority: {case.priority}
Location: {case.location}

EVIDENCE
"""
        for item in data["evidence"]:
            prompt += f"Title: {item.title}\nType: {item.evidence_type}\nDescription: {item.description}\nAI Summary: {item.ai_summary or ''}\n\n"

        prompt += "\nSUSPECTS\n"
        for suspect in data["suspects"]:
            prompt += f"Name: {suspect.full_name}\nAlias: {suspect.alias or ''}\nStatus: {suspect.status}\nRisk: {suspect.risk_level}\nNotes: {suspect.notes or ''}\n\n"

        prompt += "\nWITNESSES\n"
        for witness in data["witnesses"]:
            prompt += f"Name: {witness.full_name}\nCredibility: {witness.credibility}\nStatement: {witness.statement}\n\n"

        prompt += "\nTIMELINE\n"
        for event in data["timeline"]:
            prompt += f"{event.event_time} - {event.title}: {event.description}\n"

        return prompt

    def case_chat(
        self,
        db: Session,
        case_id: int,
        question: str
    ):
        data = self.repository.get_case_context(db, case_id)
        if data is None:
            return "Case not found."

        context = self._prepare_context(data)
        prompt = f"""
{SYSTEM_PROMPT}

{context}

Investigator Question:
{question}
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text

    def generate_summary(self, db: Session, case_id: int) -> str:
        data = self.repository.get_case_context(db, case_id)
        if data is None:
            return "Case not found."

        context = self._prepare_context(data)
        prompt = f"""
{SYSTEM_PROMPT}
You are an expert criminal investigation analyst. 
Based on the following case context, generate a concise, professional executive summary highlighting key allegations, central findings, and the current operational status.

{context}
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text

    def detect_contradictions(self, db: Session, case_id: int) -> str:
        data = self.repository.get_case_context(db, case_id)
        if data is None:
            return "Case not found."

        context = self._prepare_context(data)
        prompt = f"""
{SYSTEM_PROMPT}
Analyze the following investigation details for contradictions, discrepancies, or inconsistencies between different witness statements, suspect alibis, timeline facts, and evidence descriptions. Be thorough and list specific points of conflict with risk implications.

{context}
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text

    def risk_analysis(self, db: Session, case_id: int) -> str:
        data = self.repository.get_case_context(db, case_id)
        if data is None:
            return "Case not found."

        context = self._prepare_context(data)
        prompt = f"""
{SYSTEM_PROMPT}
Perform a comprehensive threat and risk analysis on the following case context. Assess the suspects' risk levels, identify flight risk or intimidation indicators, and evaluate physical/financial exposure. Outline high, medium, and low risks with actionable prevention recommendations.

{context}
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text