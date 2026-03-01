import io
import os

import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    from backend.model import get_model_stats, predict_single, predict_batch
except ImportError:
    from model import get_model_stats, predict_single, predict_batch  # type: ignore[no-redef]

app = Flask(__name__)

allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
CORS(app, origins=allowed_origins)


@app.get("/api/model-stats")
def model_stats():
    return jsonify(get_model_stats())


@app.post("/api/predict")
def predict():
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400
    try:
        return jsonify(predict_single(data))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.post("/api/predict-batch")
def predict_batch_endpoint():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files["file"]
    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Only CSV files are accepted"}), 400
    try:
        df = pd.read_csv(io.BytesIO(file.read()))
        return jsonify(predict_batch(df).to_dict(orient="records"))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
