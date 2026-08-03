FROM python:3.11-slim

WORKDIR /app

# Keep image size sane: CPU-only torch/torchvision wheels instead of the
# default CUDA-enabled build (which is several GB and useless without a GPU).
COPY requirements.txt .
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu \
    -r requirements.txt

COPY app ./app

# The model checkpoint is mounted at runtime (see docker-compose.yml) rather
# than baked into the image -- it's a large, environment-specific asset, and
# MODEL_PATH already supports pointing at it wherever it's mounted.
ENV MODEL_PATH=/app/model_and_data_pipeline/model_resnet50/primary_best.pth

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=3)" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
