FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

CMD ["node", "dist/server.js"]