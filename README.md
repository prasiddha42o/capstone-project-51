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