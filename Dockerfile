# Build frontend
FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend
COPY genai-frontend/package*.json ./
RUN npm install
COPY genai-frontend/src/ ./src/
COPY genai-frontend/public/ ./public/
COPY genai-frontend/tsconfig.json ./
RUN npm run build

# Build backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY pyproject.toml ./
COPY src/ ./src/

# Create directory for frontend and copy built files
COPY --from=frontend-builder /app/frontend/build/ ./genai-frontend/build/

# Install Python dependencies
RUN pip install --no-cache-dir "uvicorn>=0.24.0"
RUN pip install --no-cache-dir .

# Set environment variables
ENV PYTHONPATH=/app
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV QDRANT_URL=${QDRANT_URL}

# Expose port
EXPOSE 8080

# Run the application
CMD ["python", "-m", "uvicorn", "genai_backend.genai_backend:app", "--host", "0.0.0.0", "--port", "8080"]
