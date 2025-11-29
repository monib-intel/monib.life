FROM node:22-slim AS builder
WORKDIR /usr/src/app
COPY website/package.json .
COPY website/package-lock.json* .
RUN npm ci

FROM node:22-slim
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/ /usr/src/app/
COPY website/ .
CMD ["npx", "quartz", "build", "--serve"]
