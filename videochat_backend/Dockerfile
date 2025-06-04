FROM node:18-alpine

RUN apk add --no-cache \
    python3 \
    py3-pip \
    build-base \
    linux-headers \
    python3-dev

RUN apk add --no-cache linux-headers

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 3200

CMD ["npm", "run", "testdev"]