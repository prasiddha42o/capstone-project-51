# ♻️ Waste Assistant Nepal

An end-to-end AI system that identifies waste from a photo and tells the user how to
dispose of it correctly (recycle, compost, hazardous drop-off, etc.), tuned for waste
categories and local disposal guidance relevant to Nepal.

The project has three parts:

| Part | Location | Stack |
|---|---|---|
| **Data pipeline** | [`model_and_data_pipeline/`](model_and_data_pipeline/) | Python, merges & cleans 10+ public waste-image datasets into one labeled dataset |
| **Model training** | [`model_and_data_pipeline/`](model_and_data_pipeline/) (notebooks) | PyTorch/torchvision (ResNet50, DenseNet121, EfficientNet-B0, MobileNetV2) |
| **API backend** | [`backend/`](backend/) | FastAPI + PostgreSQL/Supabase, serves the trained model and user/prediction data |
| **Web frontend** | [`frontend/`](frontend/) | React 19 + Vite + Tailwind CSS + Supabase Auth |

---

## 🧠 What it does

1. **Identify** — a user uploads or takes a photo of an item; the backend runs it through
   a fine-tuned CNN and returns the predicted waste category, a confidence score, and
   (optionally) a clean/contaminated condition assessment.
2. **Guide** — the app returns disposal guidance and a knowledge-base entry for that
   category (recyclable, compostable, hazardous, e-waste, etc.), plus locally relevant
   drop-off info.
3. **Track** — logged-in users get a history of past predictions and a personal
   dashboard (charts of what they've scanned over time).

### Target waste categories
`plastic` · `paper` · `metal` · `glass` · `organic` · `e-waste` · `hazardous` · `general_trash`

---

## 📂 Repository structure

```text
Capstone_project/
├── backend/                     # FastAPI application (see backend/README.md)
│   ├── app/
│   │   ├── main.py              # app entrypoint / startup (loads model, DB, routers)
│   │   ├── core/                # model loading, condition classifier, confidence
│   │   │                          reasoning, config, security, storage
│   │   ├── routers/              # auth, predictions, dashboard, knowledge-base
│   │   ├── db/                   # PostgreSQL/Supabase connection + schema
│   │   └── schemas/               # Pydantic request/response models
│   ├── models_v2/                # a deployed model checkpoint + eval artifacts
│   ├── tests/                     # pytest test suite
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                    # React + Vite single-page app (see frontend/README.md)
│   ├── src/
│   │   ├── pages/                 # Home, Identify, Dashboard, LocalInfo, KnowledgeBase,
│   │   │                            Login, Register, About
│   │   ├── components/             # Navbar, Icons, LegalModal
│   │   └── supabaseClient.js       # Supabase Auth client
│   ├── package.json
│   └── Dockerfile
│
├── model_and_data_pipeline/     # dataset merging + model training
│   ├── waste_data_pipeline.py    # merges raw datasets into one labeled/split dataset
│   ├── raw_datasets/               # source datasets (see "Datasets" below)
│   ├── dataset_v2/                 # cleaned, split (train/val/test) dataset
│   ├── model_resnet50/, model_densenet121/, model_efficientnet_b0/,
│   │   model_mobilenet_v2/         # trained checkpoints + classification reports
│   │                                per architecture
│   ├── comparison_4arch/           # cross-architecture comparison metrics/plots
│   └── *.ipynb                     # training, comparison, and inference notebooks
│
├── tests/                        # pipeline-level tests (pytest)
├── docker-compose.yml             # runs backend + frontend together
├── requirements.txt                # root/shared Python dependencies (pipeline + notebooks)
└── .env.example                    # frontend build-time vars for docker-compose
```

---

## 🚀 Quickstart

### Option A — Docker Compose (recommended, runs backend + frontend together)

```bash
# 1. Frontend build-time env (Supabase + API URL)
cp .env.example .env
# edit .env with your Supabase project values

# 2. Backend runtime env (DB + Supabase + JWT secret)
cp backend/.env.example backend/.env
# edit backend/.env

# 3. Build and run
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000 (interactive docs at `/docs`, health check at `/health`)

The model checkpoint (`model_and_data_pipeline/model_resnet50/`) is mounted read-only
into the backend container rather than baked into the image, so swapping models doesn't
require a rebuild. `VITE_*` frontend vars are baked into the static bundle at build time,
so changing them requires `docker compose up --build` again, not just a restart.

### Option B — Run locally without Docker

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL / SUPABASE_* / JWT_SECRET_KEY
python -m app.cli init-db          # create DB tables
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env   # fill in VITE_SUPABASE_* / VITE_API_BASE_URL
npm run dev
```

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md)
for details specific to each.

---

## 🔌 Backend API overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server status, loaded model path, and model/DB status |
| `POST` | `/predict` | Upload an image, get back a waste-category prediction |
| `GET` | `/predictions` | List recent logged predictions |
| `GET` | `/predictions/{id}` | Retrieve a single prediction record |
| `POST` | `/register` | Create a user account |
| `POST` | `/login` | Authenticate and receive a JWT |
| `GET` | `/dashboard/{user_id}` | Aggregated stats for a user's prediction history |
| `GET` | `/knowledge-base` | List all waste-category knowledge-base entries |
| `GET` | `/knowledge-base/{category}` | Disposal guidance for one category |

Full interactive documentation is available at `/docs` (Swagger UI) once the backend is
running.

---

## 🛠 Dataset pipeline

`model_and_data_pipeline/waste_data_pipeline.py` merges 10+ public waste-image datasets
(TrashNet, RealWaste, TACO, e-waste datasets, etc.) into one consistent, cleaned dataset:

- Maps every source dataset's labels onto the 8 target categories above
- Removes near-duplicate images via perceptual hashing (`imagehash`)
- Produces a stratified 70/15/15 train/val/test split
- Augments underrepresented classes
- Writes a `dataset_report.json` summary

```bash
pip install -r requirements.txt
python model_and_data_pipeline/waste_data_pipeline.py \
    --datasets_root ./model_and_data_pipeline/raw_datasets \
    --output ./model_and_data_pipeline/dataset_v2
```

Model training and architecture comparison (ResNet50, DenseNet121, EfficientNet-B0,
MobileNetV2) live in the notebooks under `model_and_data_pipeline/` (e.g.
`Group51_4Architecture_Training.ipynb`, `Group51_Model_Comparison.ipynb`).

---

## ✅ Testing

```bash
# Pipeline tests (root)
pip install -r requirements.txt
pytest tests/

# Backend tests
cd backend
pip install -r requirements.txt
pytest

# Frontend tests
cd frontend
npm install
npm test
```

---

## ⚙️ Environment variables

| File | Used by | Key variables |
|---|---|---|
| `.env` (repo root) | `docker-compose.yml`, frontend build | `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| `backend/.env` | FastAPI backend | `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `JWT_SECRET_KEY`, `MODEL_PATH`, `FRONTEND_ORIGIN` |
| `frontend/.env` | Vite dev server (local, non-Docker) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL` |

See each `.env.example` file for the full list and defaults.

---

## 🐳 Tech stack summary

- **ML**: PyTorch, torchvision, transfer learning on ResNet50/DenseNet121/EfficientNet-B0/MobileNetV2
- **Backend**: FastAPI, PostgreSQL (Supabase), psycopg2, JWT auth, Supabase Storage
- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Supabase JS client
- **Infra**: Docker + Docker Compose, Nginx (frontend static serving)

---

## 📄 License

No license file is currently included; treat this repository as all-rights-reserved
unless the authors state otherwise.