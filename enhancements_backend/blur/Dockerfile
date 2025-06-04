FROM python:3.12-slim

WORKDIR /app/

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-socketio \
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu

COPY model.py BlurService.py mask.pth ./

EXPOSE 5001

CMD ["python", "BlurService.py"]

