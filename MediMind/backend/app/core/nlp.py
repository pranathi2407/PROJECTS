def analyze_symptoms(text: str) -> str:
    """
    Dummy function to analyze symptoms.
    Checks for specific keywords and returns a possible diagnosis.
    """
    text = text.lower()
    if "headache" in text:
        return "Migraine"
    elif "fever" in text:
        return "Flu"
    elif "cough" in text:
        return "Common Cold"
    else:
        return "General Checkup Recommended"
