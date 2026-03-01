# ChurnGuard: AI-Powered Customer Risk Predictor

ChurnGuard is an AI-powered customer churn prediction system. It identifies customers at risk of churning before disengagement. Machine learning models analyze customer identifiers and usage patterns. Billing details and demographic data are used for accurate prediction. The system generates churn risk scores and actionable insights. Enables proactive retention strategies such as personalised offers and discounts. Helps improve customer loyalty and reduce churn.

---

## Why ChurnGuard?

| # | Goal |
|---|---|
| 1 | To analyze customer usage, billing, and demographic data |
| 2 | To build an AI-based model for predicting customer churn |
| 3 | To identify customers at high risk of leaving |
| 4 | To generate churn risk scores and actionable insights |
| 5 | To enable proactive customer retention strategies |
| 6 | To improve prediction accuracy and reduce false positives |
| 7 | To support data-driven decision making in telecom services |

---

## What Is Customer Churn?

**Churn** means a customer stops using a service. In telecom, a churned customer is one who cancels their phone plan. Retaining an existing customer costs far less than acquiring a new one, so predicting who might leave — before they leave — is extremely valuable.

---

## How It Works — The Big Picture

```
Raw customer data (CSV)
        ↓
  Feature Engineering       ← select and transform the 10 most predictive columns
        ↓
  Random Forest Model       ← trained ML model makes a churn prediction
        ↓
  Probability + Verdict     ← "Will Churn" / "Will Not Churn" with a confidence %
        ↓
  Recommendations           ← actionable retention steps for at-risk customers
```

---

## Project Structure

```
churn prediction/
├── Churn_model.ipynb     ← where the model was trained (Jupyter notebook)
├── final_model.pkl       ← the saved, ready-to-use trained model
├── churn-bigml-80.csv    ← 80% of data used to train the model
├── churn-bigml-20.csv    ← 20% of data used to test the model
├── description.txt       ← project title, description, and goals
├── backend/              ← Python API server
│   ├── main.py           ← API routes (CORS, request/response handling)
│   ├── model.py          ← model loading, prediction, recommendations
│   └── requirements.txt  ← Python dependencies
└── frontend/             ← React web dashboard
    └── src/
        ├── App.tsx                      ← main app, tab routing
        ├── index.css                    ← Tailwind v4 theme + global styles
        ├── components/
        │   ├── Layout.tsx               ← dark sidebar + top navigation
        │   ├── Dashboard.tsx            ← homepage: hero, why cards, metrics
        │   ├── PredictionForm.tsx       ← single customer form (left) + result (right)
        │   ├── PredictionResult.tsx     ← probability gauge + verdict banner
        │   ├── RecommendationCard.tsx   ← actionable retention tips
        │   └── BatchPrediction.tsx      ← CSV upload + colour-coded results table
        ├── api/client.ts                ← Axios calls to backend
        └── types/index.ts               ← TypeScript data types
```

---

## The Machine Learning Model

### Training Data

Trained on the **BigML Telecom Churn dataset** — real data from ~3,300 telecom customers covering call minutes, charges, plan types, and whether they churned.

- Training set: `churn-bigml-80.csv` — 2,666 customers
- Test set: `churn-bigml-20.csv` — 667 customers
- Churn rate: ~14% (imbalanced dataset)

### Feature Engineering

Raw data has 20 columns, but most are redundant (e.g., both minutes and charges for the same call type carry the same information). The model uses only **10 carefully chosen features**:

| Feature | What It Means |
|---|---|
| `account_length` | How long the customer has been with the company (months) |
| `international_plan` | Has an international calling plan (Yes → 1, No → 0) |
| `voice_mail_plan` | Has a voicemail plan (Yes → 1, No → 0) |
| `number_vmail_messages` | Number of voicemail messages |
| `total_night_charge` | Total charges for night-time calls ($) |
| `total_intl_calls` | Number of international calls made |
| `total_intl_charge` | Total charge for international calls ($) |
| `customer_service_calls` | Number of times the customer called support |
| `high_service_calls` | **Derived** — 1 if support calls > 3, else 0 |
| `total_charge` | **Derived** — sum of day + evening + night + international charges |

> **Why drop the other columns?** Correlated columns (e.g., minutes and charges for the same call type) add noise without adding information. Removing them simplifies the model and often improves accuracy.

### The Model Pipeline

A **scikit-learn Pipeline** chains every step so the same transformations apply at training time and prediction time:

```
Step 1: ColumnTransformer (preprocessing)
    ├── OrdinalEncoder  → converts Yes/No categories to 0/1 numbers
    └── RobustScaler    → scales numeric features using median & IQR,
                          resistant to extreme outliers in call charges

Step 2: SMOTETomek (class balancing — training only)
    → Only 14% of customers churn, so the dataset is imbalanced.
      SMOTE creates synthetic minority (churn) examples;
      Tomek removes borderline ambiguous cases.
      Together they give the model a balanced view to learn from.

Step 3: RandomForestClassifier (the predictor)
    → Builds 250 decision trees on random data subsets.
      Final prediction = majority vote across all trees.
      n_estimators=250, max_depth=11,
      min_samples_split=16, min_samples_leaf=4
```

### Model Performance

Evaluated on the held-out test set (`churn-bigml-20.csv`):

| Metric | Score | What It Means |
|---|---|---|
| **Accuracy** | 97.6% | Correct predictions out of all predictions |
| **Precision** | 95.0% | Of customers flagged as churners, 95% actually churn |
| **Recall** | 87.0% | Of actual churners, the model catches 87% |
| **F1 Score** | 91.0% | Harmonic mean of precision and recall |

> **Why recall matters most here:** Missing a churner (false negative) is more costly than a false alarm. Recall measures how well the model catches actual churners before they leave.

---

## The Backend (FastAPI)

A lightweight Python server that loads `final_model.pkl` once at startup and exposes three API routes.

### API Endpoints

| Method | Route | What It Does |
|---|---|---|
| `GET` | `/api/model-stats` | Returns accuracy, recall, precision, F1, feature importances, class distribution |
| `POST` | `/api/predict` | Scores a single customer — returns `prediction`, `probability`, `recommendations` |
| `POST` | `/api/predict-batch` | Accepts a CSV file, returns all rows with `prediction` and `probability` appended |

`high_service_calls` is always derived server-side from `customer_service_calls > 3`. The client never sends it.

**Example `/api/predict` response:**
```json
{
  "prediction": 1,
  "probability": 0.82,
  "recommendations": [
    "Assign dedicated account manager; investigate repeated service complaints",
    "Introduce loyalty discount or custom capped plan"
  ]
}
```

### Recommendation Logic

When a customer is flagged as at-risk, the system checks their features against simple business rules:

| Risk Signal | Recommended Action |
|---|---|
| Support calls > 3 | Assign a dedicated account manager |
| Has international plan | Offer a discounted international bundle or 3-month roaming waiver |
| Total charges > $60 | Introduce loyalty discount or custom capped plan |
| Intl charge > $3.50 | Proactively upsell unlimited international calling package |
| Intl calls > 8 | Offer priority international calling tier |
| No voicemail plan | Bundle free voicemail as a value-add |
| Account age < 50 months | Schedule a new-customer check-in call |
| Support calls ≥ 3 | Escalate to retention specialist before threshold is crossed |

---

## The Frontend (React Dashboard)

A three-page web application served at `http://localhost:5173`.

### Dashboard Page

The homepage of ChurnGuard — centered layout with three sections:

- **Hero** — title (`ChurnGuard`), subtitle (`AI-Powered Customer Risk Predictor`), full project description, and an animated line-by-line typing effect highlighting three key capabilities
- **Why ChurnGuard?** — 7 feature cards mapping directly to the project goals, each with an icon and description
- **Model Performance** — 4 metric cards (Accuracy, Recall, Precision, F1) loaded live from the backend

### Predict Page

Two-column layout — form on the left, result on the right:

- 9 input fields; `high_service_calls` badge updates automatically as you type `customer_service_calls`
- Click **Predict Churn** → result panel updates in place without a page reload
- Result panel shows: semi-circle probability gauge, colour-coded verdict (red = WILL CHURN / green = WILL NOT CHURN), and a numbered list of retention recommendations with icons

### Batch Page

- Drag-and-drop (or click-to-browse) CSV upload zone; accepts the original BigML telecom format
- Click **Predict All** → all rows are scored by the backend
- Colour-coded results table: red rows = predicted churners, green rows = predicted to stay
- Summary banner: "X churners out of N customers"
- Download button exports the full table with `prediction` and `probability` columns appended as a CSV

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 20+

### 1 — Start the Backend

```bash
cd "churn prediction/backend"
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API is now live at `http://localhost:8000`.
Quick check: open `http://localhost:8000/api/model-stats` in your browser — you should see JSON with model metrics.

### 2 — Start the Frontend

Open a second terminal:

```bash
cd "churn prediction/frontend"
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 3 — (Optional) Retrain the Model

```bash
jupyter notebook Churn_model.ipynb
```

Run all cells in order. The last cell exports a new `final_model.pkl`. Restart the backend to pick it up.

---

## Tech Stack

| Layer | Technology |
|---|---|
| ML training | scikit-learn, imbalanced-learn, pandas, numpy |
| Model serving | FastAPI, Uvicorn, Joblib |
| Frontend framework | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v4 (CSS-first), shadcn/ui (New York style, zinc base) |
| Charts | Recharts |
| HTTP client | Axios |
| Icons | Lucide React |

---

## Key Concepts Glossary

**Churn** — A customer stopping their subscription or service.

**Feature Engineering** — Transforming raw data into a form the model can learn from. For example, summing all charge columns into one `total_charge` removes noise while keeping the key signal.

**Random Forest** — An ensemble of many decision trees. Each tree votes independently; the majority wins. More trees means more stable, reliable predictions.

**SMOTE** — Synthetic Minority Oversampling Technique. Generates artificial examples of the minority class (churners) so the model doesn't learn to simply predict "not churn" for everyone.

**Pipeline** — A scikit-learn object that chains preprocessing and the model together, guaranteeing the same transformations are applied during both training and prediction.

**Precision vs Recall** — Precision: of customers we flagged, how many actually churned? Recall: of all customers who churned, how many did we catch? There is always a trade-off between the two.

**Feature Importance** — How much each input variable contributed to the Random Forest's decisions, averaged across all 250 trees.

**RobustScaler** — Scales numeric features using median and interquartile range instead of mean and standard deviation, making it resistant to extreme outliers in call charges.
