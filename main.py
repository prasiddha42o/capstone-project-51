import io
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device('cpu')
CKPT_PATH = "/home/binisha/backend-capstone-github/model_and_data_pipeline/model_resnet50/primary_checkpoint.pth"

print(f"Loading checkpoint metadata from {CKPT_PATH}...")
ckpt = torch.load(CKPT_PATH, map_location=DEVICE)
IDX_TO_CLASS = ckpt['idx_to_class']
IMG_SIZE = ckpt['img_size']
IMAGENET_MEAN = ckpt['imagenet_mean']
IMAGENET_STD = ckpt['imagenet_std']

model = models.resnet50(weights=None)
num_features = model.fc.in_features

model.fc = nn.Sequential(
    nn.Dropout(0.2),
    nn.Linear(num_features, 256),
    nn.BatchNorm1d(256),
    nn.ReLU(),
    nn.Dropout(0.2),
    nn.Linear(256, len(IDX_TO_CLASS))
)

model.load_state_dict(ckpt['model_state_dict'])
model.to(DEVICE)
model.eval()
print("ResNet50 Model successfully loaded and ready!")

transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        
        tensor = transform(img).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            outputs = model(tensor)
            probs = torch.softmax(outputs, dim=1).cpu().numpy()[0]
            
        pred_idx = int(np.argmax(probs))
        pred_class = IDX_TO_CLASS[pred_idx]
        confidence = float(probs[pred_idx])
        
        # Get top 3 predictions for the frontend
        top3_indices = np.argsort(probs)[-3:][::-1]
        top3_list = [IDX_TO_CLASS[idx] for idx in top3_indices]
        
        # Keys match exactly what IdentifyPage.jsx expects
        return {
            "predicted_class": pred_class,
            "confidence": confidence,
            "top3": top3_list
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/")
def read_root():
    return {"message": "Model API is up and running!"}
