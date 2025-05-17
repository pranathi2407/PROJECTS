import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib

# Load your symptom data
data = pd.read_csv('symptoms_data.csv')

# Split data clearly
X_train, X_test, y_train, y_test = train_test_split(
    data['text'], 
    data['condition'], 
    test_size=0.2, 
    random_state=42
)

# Create and train ML pipeline clearly
model_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', MultinomialNB())
])

# Fit the model clearly
model_pipeline.fit(X_train, y_train)

# Evaluate accuracy clearly
predicted = model_pipeline.predict(X_test)
accuracy = accuracy_score(y_test, predicted)
print(f"Model Accuracy: {accuracy:.2f}")

# Save your trained model clearly as .pkl
joblib.dump(model_pipeline, 'symptom_model.pkl')
print("Model saved successfully as symptom_model.pkl")
