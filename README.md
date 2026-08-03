<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# ♻️ GreenNepal Waste Classification Pipeline

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
>>>>>>> 7739b5608fd806d80d4ef99912bf92338355e345
