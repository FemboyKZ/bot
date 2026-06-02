
FROM node:26-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:26-alpine

RUN apk add --no-cache dumb-init curl sshpass openssh sudo
RUN addgroup -g 1010 -S nodejs && \
    adduser -S nodejs -u 1010

WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

RUN mkdir -p logs && chown nodejs:nodejs logs

USER nodejs

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "src/index.js"]
