from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os

app = Flask(__name__)
CORS(app)

model = joblib.load("term_score_predictor.pkl")
model_features = joblib.load("model_features.pkl")

@app.route('/', methods=['GET'])
def health():
    return jsonify({"status": "ML Service is running"})

@app.route('/predict', methods=['POST'])
def predict():

    data = request.json

    sample_dict = {f: 0 for f in model_features}

    for f in ['Module_1_Score', 'Module_2_Score', 'Module_3_Score', 'Avg_Module_Score', 'Followup_Quiz_Score']:
        if f in data:
            sample_dict[f] = data[f]

    lesson_id = data.get('LessonID')
    if lesson_id:
        lesson_col = f"LessonID_{lesson_id}"
        if lesson_col in sample_dict:
            sample_dict[lesson_col] = 1

    sample = pd.DataFrame([sample_dict])[model_features]

    prediction = model.predict(sample)

    return jsonify({
        "predicted_score": float(prediction[0])
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)