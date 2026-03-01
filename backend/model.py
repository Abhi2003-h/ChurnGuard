import joblib
import numpy as np
import pandas as pd
from pathlib import Path

MODEL_PATH = Path(__file__).parent.parent / "final_model.pkl"

FEATURE_NAMES = [
    "account_length",
    "international_plan",
    "voice_mail_plan",
    "number_vmail_messages",
    "total_night_charge",
    "total_intl_calls",
    "total_intl_charge",
    "customer_service_calls",
    "high_service_calls",
    "total_charge",
]

# Hardcoded metrics from notebook evaluation
MODEL_METRICS = {
    "accuracy": 0.976,
    "recall": 0.870,
    "precision": 0.950,
    "f1": 0.910,
}

# Class distribution from training data (churn-bigml-80.csv)
CLASS_DISTRIBUTION = {
    "not_churned": 2278,
    "churned": 388,
}

_model = None


def get_model():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model


def get_feature_importances() -> list[dict]:
    model = get_model()
    rf = model.named_steps["RF"]
    importances = rf.feature_importances_
    result = [
        {"name": name, "importance": round(float(imp), 4)}
        for name, imp in zip(FEATURE_NAMES, importances)
    ]
    result.sort(key=lambda x: x["importance"], reverse=True)
    return result


def get_model_stats() -> dict:
    return {
        **MODEL_METRICS,
        "feature_importances": get_feature_importances(),
        "class_distribution": CLASS_DISTRIBUTION,
    }


def build_recommendations(features: dict) -> list[str]:
    recs = []
    if features.get("high_service_calls") == 1:
        recs.append(
            "Assign dedicated account manager; investigate repeated service complaints"
        )
    if features.get("international_plan") == 1:
        recs.append(
            "Offer discounted international bundle or 3-month roaming waiver"
        )
    if features.get("total_charge", 0) > 60:
        recs.append(
            "Introduce loyalty discount or custom capped plan"
        )
    if features.get("total_intl_charge", 0) > 3.5:
        recs.append(
            "Proactively upsell unlimited international calling package"
        )
    if features.get("total_intl_calls", 0) > 8:
        recs.append("Offer priority international calling tier")
    if features.get("voice_mail_plan") == 0:
        recs.append(
            "Bundle free voicemail as value-add to improve satisfaction"
        )
    if features.get("account_length", 999) < 50:
        recs.append(
            "New customer — schedule a check-in call to confirm satisfaction"
        )
    if features.get("customer_service_calls", 0) >= 3:
        recs.append(
            "Escalate to retention specialist before threshold is crossed"
        )
    return recs


def predict_single(input_dict: dict) -> dict:
    # Derive high_service_calls server-side
    csc = input_dict.get("customer_service_calls", 0)
    high_service_calls = 1 if csc > 3 else 0

    features = {**input_dict, "high_service_calls": high_service_calls}
    row = pd.DataFrame([[features[f] for f in FEATURE_NAMES]], columns=FEATURE_NAMES)

    model = get_model()
    prediction = int(model.predict(row)[0])
    probability = float(model.predict_proba(row)[0][1])
    recommendations = build_recommendations(features)

    return {
        "prediction": prediction,
        "probability": round(probability, 4),
        "recommendations": recommendations,
    }


def preprocess_batch(df: pd.DataFrame) -> pd.DataFrame:
    """Apply same feature engineering as the training notebook."""
    out = pd.DataFrame()
    out["account_length"] = df["Account length"]
    out["international_plan"] = df["International plan"].map({"Yes": 1, "No": 0})
    out["voice_mail_plan"] = df["Voice mail plan"].map({"Yes": 1, "No": 0})
    out["number_vmail_messages"] = df["Number vmail messages"]
    out["total_night_charge"] = df["Total night charge"]
    out["total_intl_calls"] = df["Total intl calls"]
    out["total_intl_charge"] = df["Total intl charge"]
    out["customer_service_calls"] = df["Customer service calls"]
    out["high_service_calls"] = (df["Customer service calls"] > 3).astype(int)
    out["total_charge"] = (
        df["Total day charge"]
        + df["Total eve charge"]
        + df["Total night charge"]
        + df["Total intl charge"]
    )
    return out


def predict_batch(df: pd.DataFrame) -> pd.DataFrame:
    processed = preprocess_batch(df)
    model = get_model()
    predictions = model.predict(processed)
    probabilities = model.predict_proba(processed)[:, 1]

    result = df.copy()
    result["prediction"] = predictions
    result["probability"] = np.round(probabilities, 4)
    return result
