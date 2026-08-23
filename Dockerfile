# ==========================================
# Multi-Stage Full-Stack Dockerfile for Render
# ==========================================

# Stage 1: Build React Vite Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Python FastAPI Backend + Serve Frontend
FROM python:3.11-slim

WORKDIR /app

# Prevent Python from buffering stdout/stderr
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install system dependencies if required
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ .

# Copy built frontend assets into backend/static
COPY --from=frontend-builder /app/frontend/dist ./static

# Create uploads directory
RUN mkdir -p uploads

# Expose port (Render automatically sets $PORT environment variable)
ENV PORT=8000
EXPOSE 8000

# Start FastAPI with Uvicorn on dynamic PORT for Render
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
