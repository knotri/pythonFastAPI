# Use the official Python base image
FROM python:3.10-slim

# Set the working directory
WORKDIR /code

# Copy project files
COPY ./ /code
# COPY ./main.py /app/main.py
# COPY ./requirements.txt /code/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port that FastAPI will run on
EXPOSE 8000

# Command to run the application
# CMD ["fastapi", "run", "app/main.py", "--port", "8000"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]