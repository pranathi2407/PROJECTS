import tempfile
import os
import speech_recognition as sr
from gtts import gTTS
from fastapi import UploadFile, HTTPException

async def speech_to_text(file: UploadFile) -> str:
    recognizer = sr.Recognizer()
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
        content = await file.read()
        temp_audio.write(content)
        temp_audio.close()

        with sr.AudioFile(temp_audio.name) as source:
            audio_data = recognizer.record(source)

        os.unlink(temp_audio.name)

    try:
        return recognizer.recognize_google(audio_data)
    except sr.UnknownValueError:
        raise HTTPException(status_code=400, detail="Could not understand the audio.")

async def text_to_speech(text: str) -> str:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3", dir="assets/audio_responses") as audio_file:
        tts = gTTS(text=text, lang="en")
        tts.save(audio_file.name)
    return audio_file.name
