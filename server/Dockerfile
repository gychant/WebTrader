# syntax=docker/dockerfile:1
FROM python:3.9-slim-buster
WORKDIR /app
COPY ./requirements.txt /app
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5001
ENV FLASK_APP=application.py
CMD ["gunicorn", "--workers", "4", "--threads", "100", "-b", "0.0.0.0:5001", "--preload", "application:app"]