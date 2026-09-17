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
    
    # Initialize dictionary with zeros for expected features
    sample_dict = {f: 0.0 for f in model_features}

    # Match numeric features
    for f in model_features:
        if f in data:
            # Ensure input is clipped between 0 and 100 as per training normalization
            val = float(data[f])
            sample_dict[f] = max(0.0, min(100.0, val))

    sample = pd.DataFrame([sample_dict])[model_features]
    prediction = model.predict(sample)
    
    predicted_percentage = float(prediction[0])
    # Clip prediction between 0 and 100 just in case
    predicted_percentage = max(0.0, min(100.0, predicted_percentage))

    return jsonify({
        "predicted_score": predicted_percentage
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)