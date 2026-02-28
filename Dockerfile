# Use the official Microsoft Playwright image (includes Python and all Chromium OS dependencies)
FROM mcr.microsoft.com/playwright/python:v1.42.0-jammy

# Set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Download the Chromium binaries (OS libraries are already in the base image)
RUN playwright install chromium

# Copy the rest of the application code
COPY . .

# Expose the port (Railway provides the PORT environment variable dynamically)
EXPOSE $PORT

# Start via python main.py — Uvicorn is launched programmatically inside main.py
# No port args here; main.py reads $PORT from the environment directly
CMD ["xvfb-run", "-a", "python", "main.py"]