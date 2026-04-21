# Invoice Generator - Backend

The backend of the Invoice Generator project is built using Go and the Fiber framework. It exposes RESTful APIs to manage authentication, items, invoices, and statistical dashboard data, communicating with a PostgreSQL database.

## Tech Stack

- **Language:** Go 1.25.0
- **Framework:** Fiber v3 (`github.com/gofiber/fiber/v3`) - High performance web framework inspired by Express.js
- **Database:** PostgreSQL
- **ORM:** GORM (`gorm.io/gorm` & `gorm.io/driver/postgres`) - For database migrations and straightforward data access.
- **Authentication:** JWT (`github.com/golang-jwt/jwt/v5`)
- **Environment config:** godotenv (`github.com/joho/godotenv`)

## Project Structure

```text
backend/
├── config/             # Database connection and environment configuration.
├── handlers/           # HTTP handlers/controllers mapping endpoints to functionality.
├── middleware/         # Fiber middlewares (e.g., JWT Authentication).
├── models/             # GORM definitions for the database schema models.
├── seeder/             # Database seeding script for generating initial item catalog.
├── utils/              # Utility functions for auth, jwt parsing, etc.
├── Dockerfile          # Configuration for building the Docker image.
├── main.go             # Application entrypoint & HTTP router configuration.
├── go.mod / go.sum     # Go module definitions.
```

## Database Schema

The system uses GORM's `AutoMigrate` for initializing the schema which consists of three main components:

1. **Items** (`items`):
   - Stores catalog data with unique `Code`, `Name`, and `Price`.
   - Note: Value is stored in cents (`int64`).
2. **Invoices** (`invoices`):
   - Main order record with `InvoiceNumber`, sender and receiver info, and `TotalAmount`.
3. **Invoice Details** (`invoice_details`):
   - Join table containing line items for an invoice: `ItemID`, `Quantity`, historical `Price`, and computed `Subtotal`.

## Environment Variables

These variables are defined in the project `.env` or `.env.docker` and injected into the service:

| Variable      | Description                            | Default                             |
| ------------- | -------------------------------------- | ----------------------------------- |
| `DB_HOST`     | Database host name / container name    | `postgres`                          |
| `DB_PORT`     | Database port number                   | `5432`                              |
| `DB_USER`     | Database user name                     | `postgres`                          |
| `DB_PASSWORD` | Database password                      | `postgres`                          |
| `DB_NAME`     | Database schema name                   | `invoice_generator`                 |
| `SERVER_PORT` | Port the backend listens on            | `8080`                              |
| `JWT_SECRET`  | Secret key for JWT signatures          | `invoice_generator_secret_key_2026` |
| `JWT_EXPIRY`  | Time until JWT token expires           | `24h`                               |
| `WEBHOOK_URL` | Endpoint to call upon invoice creation | `http://localhost:9000/webhook`     |

## API Endpoints

### Public Endpoints

- **`POST /api/login`**
  - Authenticates user credentials and returns a JWT token.
- **`GET /api/items`**
  - Retrieves catalog items. Requires `?code=` query parameter for text-based searching. Returns up to 50 matching records.

### Protected Endpoints (Requires valid JWT `Authorization` Header)

- **`POST /api/invoices`**
  - Creates a new invoice. Validates that quantities > 0 and securely fetches latest prices from the database (Zero Trust pricing). On success, it also dispatches an async POST webhook notification.
- **`GET /api/invoices`**
  - Fetches complete history of all invoices including sub-details (`InvoiceDetail`). Ordered descending by creation date.
- **`GET /api/stats`**
  - Generates dashboard statistics. Returns total invoices, revenue for today, current item count, and a brief list of the 5 most recent invoices.

## Running the Application

### Using Bare-Metal Go

Ensure your Postgres is running, duplicate `.env.docker` to `.env` locally (adjusting ports as needed), and run:

```bash
cd backend
go mod tidy
go run main.go
```

The DB seeder runs automatically upon app initialization, populating the database with a preset catalog (Approx. 30 items) if it is empty.

### Using Docker Compose (from root dir)

The application is fully configured as a multi-stage Docker build for minimal footprint in production.

```bash
docker-compose up --build -d backend
```
