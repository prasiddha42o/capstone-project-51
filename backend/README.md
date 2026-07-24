# ♻️ GreenNepal Waste Classification Pipeline

AI-based waste classification system that merges multiple datasets, cleans them, and prepares a structured dataset for model training.

---

## 🚀 Project Overview

This project builds a **complete data pipeline** for waste classification using multiple datasets.

It:
- Merges **5+ datasets**
- Maps all labels into **8 standard waste categories**
- Removes duplicate images using **perceptual hashing**
- Creates **stratified splits (70/15/15)**
- Augments underrepresented classes
- Generates a **dataset report**

---

## 🧠 Target Classes

- Plastic  
- Paper  
- Metal  
- Glass  
- Organic  
- E-waste  
- Hazardous  
- General Trash  

---

## 📂 Project Structure
model_and_data_pipeline/
│
├── notebooks/
│ ├── GreenNepal_Inference.ipynb
│ └── Group51_Training_Local.ipynb
│
├── src/
│ └── waste_data_pipeline.py
│
├── requirements.txt
├── README.md
└── .gitignore


---

## ⚙️ Installation

```bash
pip install -r requirements.txt

## ▶️ How to Run

Place all datasets inside:

raw_datasets/

Then run:

python waste_data_pipeline.py --datasets_root ./raw_datasets --output ./dataset

---

## Backend API

1. Place your trained model checkpoint at `models/primary_checkpoint.pth`.
   Alternatively set the environment variable `MODEL_PATH` to the full checkpoint path.
2. Start the API server:

```powershell
cd "C:\Users\arbit\OneDrive\Desktop\cpstone"
python app.py
```

or with Uvicorn:

```powershell
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

3. Test the API:

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
Invoke-RestMethod -Uri "http://localhost:8000/predict" -Method Post -Form @{ file = Get-Item 'C:\path\to\image.jpg' }
```

4. Prediction logging is stored in SQLite at `db/waste_predictions.db`.

### Available endpoints

- `GET /health` — server status and loaded model path
- `POST /predict` — upload an image file and receive a waste prediction
- `GET /predictions` — list recent logged predictions
- `GET /predictions/{id}` — retrieve a single prediction record
