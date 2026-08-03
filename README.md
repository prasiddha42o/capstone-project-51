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