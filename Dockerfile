FROM node:22-alpine
WORKDIR /app

COPY package.json ./
COPY server.js ./
COPY scripts ./scripts
COPY public ./public

RUN node scripts/build-600-questions.js && node scripts/build-sahinh-svg.js

ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000

VOLUME ["/app/data"]

CMD ["node", "server.js"]
