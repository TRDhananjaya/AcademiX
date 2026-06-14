from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

model = joblib.load("term_score_predictor.pkl")

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
    app.run(debug=True, port=5001)