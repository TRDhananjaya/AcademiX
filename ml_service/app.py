# pyrefly: ignore [missing-import]

from flask import Flask, request, jsonify
from flask_cors import CORS # type: ignore
import pandas as pd # type: ignore
import joblib
import os

app = Flask(__name__)
CORS(app) # type: ignore

model = joblib.load("term_score_predictor.pkl")
model_features = joblib.load("model_features.pkl")

@app.route('/', methods=['GET'])
def health():
    return jsonify({"status": "ML Service is running"})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    sample_dict = {f: 0 for f in model_features}

    # Match numeric features
    numeric_features = [
        'Module_1_Score', 'Module_2_Score', 'Module_3_Score',
        'Avg_Module_Score', 'Weak_Module_Count', 'Priority_Score',
        'Followup_Quiz_Score', 'Improvement_Percentage'
    ]
    
    for f in numeric_features:
        if f in data:
            sample_dict[f] = data[f]

    # Handle Categorical variables
    lesson_id = data.get('LessonID')
    if lesson_id:
        lesson_col = f"Lesson_ID_{lesson_id}"
        if lesson_col in sample_dict:
            sample_dict[lesson_col] = 1
            
    lesson_perf = data.get('Lesson_Performance')
    if lesson_perf:
        perf_col = f"Lesson_Performance_{lesson_perf}"
        if perf_col in sample_dict:
            sample_dict[perf_col] = 1
            
    quiz_diff = data.get('Quiz_Difficulty')
    if quiz_diff:
        diff_col = f"Quiz_Difficulty_{quiz_diff}"
        if diff_col in sample_dict:
            sample_dict[diff_col] = 1

    sample = pd.DataFrame([sample_dict])[model_features]
    prediction = model.predict(sample)

    return jsonify({
        "predicted_score": float(prediction[0])
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)