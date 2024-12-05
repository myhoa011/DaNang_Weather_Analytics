FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for scikit-learn
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    python-dotenv==1.0.0 \
    aiohttp==3.9.1 \
    pandas==2.2.2 \
    numpy==2.0.2 \
    scikit-learn==1.5.2 \
    loguru==0.7.2 \
    yacs==0.1.8 \
    fastapi==0.115.5 \
    uvicorn==0.32.1 \
    matplotlib==3.9.2

# Copy shared modules
COPY logger.py /app/src/
COPY config.py /app/src/

# Copy service code
COPY backend/data_clustering /app/src/data_clustering/

# Create necessary directories
RUN mkdir -p logs configs

ENV PYTHONPATH=/app

# Run cluster_service.py instead of data_clustering.py
CMD ["python", "-m", "src.data_clustering.data_clustering"]