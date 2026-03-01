# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Telecom customer churn prediction system with a decoupled architecture:
- **`Churn_model.ipynb`** — Model training notebook (EDA, feature engineering, model selection, hyperparameter tuning, export)
- **`backend/`** — Flask server that loads the model and serves prediction endpoints
- **`frontend/`** — React + Vite + Tailwind CSS v4 + shadcn/ui dashboard

## Directory Structure

```
churn prediction/
├── backend/
│   ├── main.py           ← Flask routes + CORS
│   ├── model.py          ← model loading, predict_single, predict_batch, recommendations
│   └── requirements.txt
├── frontend/
│   ├── vite.config.ts    ← @tailwindcss/vite plugin + @ alias → ./src
│   ├── tsconfig.app.json ← paths: {"@/*": ["./src/*"]}
│   ├── components.json   ← shadcn config (new-york style, zinc base)
│   └── src/
│       ├── main.tsx
│       ├── App.tsx             ← tab state (dashboard | predict | batch), fetches model stats on mount
│       ├── index.css           ← @import "tailwindcss" + @theme dark color vars
│       ├── api/client.ts       ← axios: getModelStats, predictSingle, predictBatch
│       ├── types/index.ts      ← PredictRequest, PredictResponse, ModelStats, BatchRow
│       ├── lib/utils.ts        ← cn() helper (clsx + tailwind-merge)
│       └── components/
│           ├── Layout.tsx           ← dark sidebar nav + top header
│           ├── Dashboard.tsx        ← metric cards + feature importance bar chart + class distribution donut
│           ├── PredictionForm.tsx   ← two-column layout: form (left) + result (right)
│           ├── PredictionResult.tsx ← semi-circle gauge + verdict banner
│           ├── RecommendationCard.tsx ← retention tips with lucide icons
│           └── BatchPrediction.tsx  ← drag-and-drop CSV upload + color-coded results table
├── Churn_model.ipynb
├── churn-bigml-80.csv    ← training data
├── churn-bigml-20.csv    ← test data
└── final_model.pkl       ← trained sklearn Pipeline
```

## Commands

```bash
# Backend
cd "churn prediction/backend"
pip install -r requirements.txt
python main.py        # http://localhost:8000

# Frontend
cd "churn prediction/frontend"
npm install
npm run dev        # http://localhost:5173

# Training notebook
jupyter notebook Churn_model.ipynb
```

## API Routes (backend/main.py)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/model-stats` | Accuracy, recall, precision, F1, feature importances, class distribution |
| POST | `/api/predict` | Single customer prediction → `{prediction, probability, recommendations}` |
| POST | `/api/predict-batch` | CSV file upload → JSON array with `prediction` + `probability` columns |

CORS is open to `http://localhost:5173`.

## Feature Engineering (critical — must be consistent)

The notebook `preprocess()` and `backend/model.py` `preprocess_batch()` must produce the same 10 columns in the same order:

```
account_length, international_plan, voice_mail_plan, number_vmail_messages,
total_night_charge, total_intl_calls, total_intl_charge,
customer_service_calls, high_service_calls, total_charge
```

Key transformations:
- `high_service_calls` = 1 if `customer_service_calls > 3` else 0 — derived server-side, never sent by client
- `total_charge` = day + eve + night + intl charges
- `international_plan` / `voice_mail_plan`: "Yes"→1, "No"→0
- Dropped: state, area_code, all minute columns, eve/day charges, most call-count columns

## Model Pipeline (final_model.pkl)

Sklearn `Pipeline` containing:
1. `ColumnTransformer` — OrdinalEncoder on categoricals + RobustScaler on numerics
2. `SMOTETomek` — training-time resampling only; ignored at predict time
3. `RandomForestClassifier(n_estimators=250, max_depth=11, min_samples_split=16, min_samples_leaf=4)`

Access RF step via `model.named_steps['RF']`.

## Frontend Notes

- **Tailwind v4**: CSS-first config — no `tailwind.config.ts`. All theme tokens live in `@theme {}` block inside `src/index.css`. Use `@tailwindcss/vite` plugin (not postcss).
- **shadcn/ui**: `npx shadcn@latest add <component>` writes to a literal `@/` folder — move files to `src/components/ui/` manually.
- **`class-variance-authority`** must be installed separately (`npm install class-variance-authority`); shadcn does not auto-install it.
- **Predict page layout**: `PredictionForm` is a flex row — form (fixed 560px) on the left, `PredictionResult` + `RecommendationCard` fill the right column.

## Recommendation Logic (backend/model.py)

Pure function `build_recommendations(features)` — no ML involved:

| Condition | Recommendation |
|-----------|---------------|
| `high_service_calls == 1` | Assign dedicated account manager |
| `international_plan == 1` | Offer discounted international bundle |
| `total_charge > 60` | Introduce loyalty discount or capped plan |
| `total_intl_charge > 3.5` | Upsell unlimited international package |
| `total_intl_calls > 8` | Offer priority international calling tier |
| `voice_mail_plan == 0` | Bundle free voicemail as value-add |
| `account_length < 50` | Schedule new-customer check-in call |
| `customer_service_calls >= 3` | Escalate to retention specialist |
