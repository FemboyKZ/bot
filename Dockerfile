
FROM node:25-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

FROM node:25-alpine

RUN apk add --no-cache dumb-init python3 py3-pip
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

RUN mkdir -p logs && chown nodejs:nodejs logs

USER nodejs

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/index.js"]
