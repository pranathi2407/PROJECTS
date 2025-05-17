from pydantic import BaseModel

class SymptomInput(BaseModel):
    symptoms: str

class HealthAssessment(BaseModel):
    condition: str
    recommendations: str
