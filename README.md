# ♻️ Waste Assistant Nepal — Waste Classification Pipeline

AI-based waste classification system that merges multiple datasets, cleans them, and prepares a structured dataset for model training.

## 🚀 Project Overview
This project builds a **complete data pipeline** for waste classification using multiple datasets.

---
## 🛠 Pipeline Features
- Merges **5+ datasets**
- Maps all labels into **8 standard waste categories**
- Removes duplicate images using **perceptual hashing**
- Creates **stratified splits (70/15/15)**
- Augments underrepresented classes
- Generates a **dataset report**

---
## 🧠 Target Classes
- Plastic, Paper, Metal, Glass
- Organic, E-waste, Hazardous, General Trash

---
## 📂 Project Structure
```text
model_and_data_pipeline/
├── notebooks/
├── src/waste_data_pipeline.py
├── requirements.txt
├── README.md
└── .gitignore

---
## ⚙️ Installation & Usage
```bash
pip install -r requirements.txt
python waste_data_pipeline.py --datasets_root ./raw_datasets --output ./dataset
```

---
## 🐳 Running the App with Docker

Runs the FastAPI backend and the built frontend together via `docker-compose.yml` at the repo root.

1. Copy `.env.example` to `.env` at the repo root, and fill in your Supabase values (used to build the frontend).
2. Make sure `backend/.env` exists (copy from `backend/.env.example`) with your `DATABASE_URL`/`SUPABASE_*`/`JWT_SECRET_KEY`.
3. Run:
   ```bash
   docker compose up --build
   ```
4. Frontend: http://localhost:5173 · Backend: http://localhost:8000 (docs at `/docs`, status at `/health`).

The model checkpoint (`model_and_data_pipeline/model_resnet50/`) is mounted into the backend container read-only rather than baked into the image, so it isn't duplicated and updating the model doesn't require rebuilding. `VITE_*` frontend env vars are baked into the static bundle at build time (Vite's behavior), so changing them requires `docker compose up --build` again, not just a restart.