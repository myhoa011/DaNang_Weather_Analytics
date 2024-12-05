FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for mysql-replication
RUN apt-get update && apt-get install -y \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    fastapi==0.115.5 \
    uvicorn==0.32.1 \
    python-dotenv==1.0.0 \
    aiomysql==0.2.0 \
    pydantic==2.10.1 \
    mysql-replication==1.0.9 \
    loguru==0.7.2 \
    PyYAML==6.0.2 \
    yacs==0.1.8 \
    pandas==2.2.2 \
    cryptography==44.0.0 \
    redis==5.2.0

# Copy shared modules
COPY config.py /app/src/
COPY logger.py /app/src/

# Copy service code
COPY db_api /app/src/db_api/

# Create necessary directories
RUN mkdir -p logs configs

ENV PYTHONPATH=/app

# Command sẽ được override bởi docker-compose
CMD ["uvicorn", "src.db_api.db_api:app", "--host", "0.0.0.0", "--port", "8000"]
