FROM node:20.9.0-alpine3.17

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY src ./src
COPY public ./public
COPY tsconfig.json ./tsconfig.json
COPY *.config.mjs ./
COPY *.config.ts ./
COPY *.config.js ./


ARG NEXT_PUBLIC_GRAPHQL_API_URL
ENV NEXT_PUBLIC_GRAPHQL_API_URL ${NEXT_PUBLIC_GRAPHQL_API_URL}

ARG NEXT_PUBLIC_UPLOAD_API_ENDPOINT
ENV NEXT_PUBLIC_UPLOAD_API_ENDPOINT ${NEXT_PUBLIC_UPLOAD_API_ENDPOINT}

CMD npm run dev