import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io

# Works when run locally via uvicorn (backend/ in sys.path)
# and on Vercel (project root in sys.path via api/index.py)
try:
    from backend.model import get_model_stats, predict_single, predict_batch
except ImportError:
    from model import get_model_stats, predict_single, predict_batch  # type: ignore[no-redef]

app = FastAPI(title="Churn Prediction API")

allowed_origins = os.environ.get(
    "ALLOWED_ORIGINS", "http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    account_length: int
    international_plan: int
    voice_mail_plan: int
    number_vmail_messages: int
    total_night_charge: float
    total_intl_calls: int
    total_intl_charge: float
    customer_service_calls: int
    total_charge: float


@app.get("/api/model-stats")
def model_stats():
    return get_model_stats()


@app.post("/api/predict")
def predict(req: PredictRequest):
    try:
        return predict_single(req.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict-batch")
async def predict_batch_endpoint(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        return predict_batch(df).to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
