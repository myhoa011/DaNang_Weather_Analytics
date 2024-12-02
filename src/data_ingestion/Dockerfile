FROM python:3.10-slim

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir \
    python-dotenv==1.0.0 \
    aiohttp==3.9.1 \
    APScheduler==3.10.1 \
    aiofiles==23.2.1 \
    loguru==0.7.2 \
    PyYAML==6.0.2 \
    yacs==0.1.8 \
    pandas==2.2.2

# Copy shared modules
COPY config.py /app/src/
COPY logger.py /app/src/

# Copy service code
COPY data_ingestion /app/src/data_ingestion/

# Create necessary directories
RUN mkdir -p logs configs data

ENV PYTHONPATH=/app

CMD ["python", "-m", "src.data_ingestion.data_ingestion"]
