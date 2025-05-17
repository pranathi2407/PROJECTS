from fastapi import FastAPI
from .routes import router


app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the MediMind API"}

app.include_router(router)
