FROM python:3.13.5-slim
WORKDIR /backend

COPY ./app /backend/app
COPY ./tests /backend/tests
COPY requirements.txt /backend/

RUN pip install -r requirements.txt
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]