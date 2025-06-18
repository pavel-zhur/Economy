FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
COPY vendor/uptrace_patched ./vendor/uptrace_patched

# Install Python dependencies
RUN pip install -r requirements.txt
    
# Copy application code
COPY . .

# Create a non-root user
RUN useradd --create-home --shell /bin/bash app_user && \
    chown -R app_user:app_user /app
USER app_user

# Expose port
EXPOSE 8000

# Default command (can be overridden in docker-compose)
CMD ["chainlit", "run", "app.py", "--host", "0.0.0.0", "--port", "8000"] 