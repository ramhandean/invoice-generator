# Multi-stage build for Go Backend

# Stage 1: Build
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git make

# Copy Go module files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o invoice-generator .

# Stage 2: Runtime
FROM alpine:latest

# Install ca-certificates for HTTPS and timezone data
RUN apk add --no-cache ca-certificates tzdata curl

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/invoice-generator .

ADD .env* ./

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api/items?code=ITEM || exit 1

# Run the application
CMD ["./invoice-generator"]
