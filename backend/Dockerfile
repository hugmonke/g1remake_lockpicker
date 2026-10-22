# Use an official Python runtime as a parent image
FROM python:3.13.5-slim

# Set the working directory in the container
WORKDIR /backend

# Copy the current directory contents into the container at /backend
COPY ./app /backend/app
COPY ./tests /backend/tests
COPY requirements.txt /backend/

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Run app.py when the container launches
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]