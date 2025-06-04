FROM python:3.12-slim

WORKDIR /app/

RUN apt-get update && apt-get install -y --no-install-recommends \
    autoconf \
    libtool \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/Desklop/RNNoise_Wrapper \
    && cd RNNoise_Wrapper \
    && chmod +x compile_rnnoise.sh \
    && ./compile_rnnoise.sh \
    && pip install git+https://github.com/Desklop/RNNoise_Wrapper

COPY ./requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu

COPY model_actual.py NoiseSuppressionService.py model_4gru.pth process_audio.py ./

EXPOSE 5002

CMD ["python", "NoiseSuppressionService.py"]


