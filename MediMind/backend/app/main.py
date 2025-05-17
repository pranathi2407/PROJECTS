from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.symptoms import router as symptom_router

# FastAPI app instance
app = FastAPI(
    title="MediMind Symptom Checker API",
    version="1.0.0",
    description="Simple API for analyzing symptoms using dummy logic."
)

# CORS setup (allow all origins for simplicity)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Root endpoint for testing the API
@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to MediMind Symptom Checker API"}

# Include the symptom analysis router under /api
app.include_router(symptom_router, prefix="/api", tags=["Symptoms"])
