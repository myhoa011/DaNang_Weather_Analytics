FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for scikit-learn and statsmodels
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
    statsmodels==0.14.4 \
    loguru==0.7.2 \
    yacs==0.1.8 \
    redis==5.2.0

# Copy shared modules
COPY logger.py /app/src/
COPY config.py /app/src/

# Copy service code
COPY backend/data_analysis /app/src/data_analysis/

# Create necessary directories
RUN mkdir -p logs configs

ENV PYTHONPATH=/app

CMD ["python", "-m", "src.data_analysis.data_analysis"]