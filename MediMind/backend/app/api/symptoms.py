from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class SymptomInput(BaseModel):
    text: str  # The symptom description input by the user

class SymptomResponse(BaseModel):
    diagnosis: str
    recommendation: str

@router.post("/analyze_symptoms", response_model=SymptomResponse)
async def analyze_symptoms(symptom: SymptomInput):
    # Dummy symptom analysis logic
    if "headache" in symptom.text.lower() and "fever" in symptom.text.lower():
        diagnosis = "Migraine"
        recommendation = "Please consult a healthcare provider for a detailed evaluation."
    else:
        diagnosis = "General Checkup Recommended"
        recommendation = "Visit a healthcare provider for further analysis."
    
    return SymptomResponse(diagnosis=diagnosis, recommendation=recommendation)
