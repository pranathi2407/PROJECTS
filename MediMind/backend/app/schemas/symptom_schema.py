from pydantic import BaseModel

class SymptomRequest(BaseModel):
    text: str

class SymptomResponse(BaseModel):
    diagnosis: str
    recommendation: str
