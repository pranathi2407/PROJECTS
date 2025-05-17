# backend/app/core/config.py

import os

# Define the path for the symptom model (update as needed)
SYMPTOM_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "symptom_model.pkl")

# Configuration for audio file storage paths
AUDIO_RESPONSE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "audio_responses")
TEMP_AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "temp_audio")

# You can add more configuration variables here as needed.
