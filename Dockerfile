# Stage 1: Build Frontend
FROM node:22-slim AS frontend-builder
WORKDIR /app/frontend
RUN npm install -g pnpm
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install
COPY frontend/ ./
RUN pnpm build

# Stage 2: Build Backend
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY backend/ ./backend/
RUN cd backend && go build -o blisspanel-backend .

# Stage 3: Final Image
FROM alpine:latest
RUN apk add --no-cache bash docker-cli
WORKDIR /app
COPY --from=backend-builder /app/backend/blisspanel-backend ./
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# The backend expects frontend in ../frontend/dist relative to the binary location
# Or we can adjust the backend to look in a specific path.
# For simplicity, let's keep the structure:
# /app/blisspanel-backend
# /app/frontend/dist

EXPOSE 8080
CMD ["./blisspanel-backend"]
