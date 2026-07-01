from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os

app = Flask(__name__)
CORS(app)

model = joblib.load("term_score_predictor.pkl")

@app.route('/', methods=['GET'])
def health():
    return jsonify({"status": "ML Service is running"})

@app.route('/predict', methods=['POST'])
def predict():

    data = request.json

    features = [[
        data['Module_1_Score'],
        data['Module_2_Score'],
        data['Module_3_Score'],
        data['Avg_Module_Score'],
        data['Followup_Quiz_Score']
    ]]

    prediction = model.predict(features)

    return jsonify({
        "predicted_score": float(prediction[0])
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)