# backend/tests/test_symptoms.py

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_symptoms():
    payload = {
        "description": "I have a severe headache and some nausea."
    }
    response = client.post("/api/symptoms", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "diagnosis" in data
    assert "audio_response" in data
