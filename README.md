# Multi-Step Invoice Generator - Full Stack

A complete invoice generation system built with **Go Fiber** (backend) and **Next.js 14** (frontend) with TypeScript, TailwindCSS, and JWT authentication.

## 📦 Project Structure

```
invoice-generator/
├── backend/                    # Go Fiber backend
│   ├── Dockerfile              # Multi-stage Go build
│   ├── main.go                # App entry point
│   ├── .env                   # Environment configuration
│   ├── config/                # Database & config
│   ├── models/                # Data models (Item, Invoice, InvoiceDetail)
│   ├── handlers/              # API handlers (auth, items, invoices)
│   ├── middleware/            # JWT middleware
│   ├── utils/                 # JWT utilities
│   ├── seeder/                # Database seeder
│   ├── go.mod & go.sum        # Go dependencies
│   └── invoice-generator      # Compiled binary
│
├── frontend/                  # Next.js 14 frontend
│   ├── Dockerfile             # Multi-stage Node.js build
│   ├── pages/                 # Pages (login, wizard steps)
│   ├── store/                 # Zustand store
│   ├── lib/                   # Axios instance
│   ├── utils/                 # Utilities (JWT, debounce, etc.)
│   ├── styles/                # Global CSS
│   ├── components/            # React components
│   ├── package.json           # npm dependencies
│   └── README.md              # Frontend documentation
│
├── docker-compose.yml         # Orchestration (PostgreSQL, Backend, Frontend)
├── .env.docker                # Docker default environment variables
├── DOCKER.md                  # Complete Docker guide
├── start.sh                   # Convenience script (Linux/Mac)
├── start.bat                  # Convenience script (Windows)
└── README.md                  # This file
```

## 🚀 Quick Start

### Option 1: Docker (Recommended) ⭐

**One command to start everything:**

```bash
docker-compose up
```

That's it! All services will start automatically:

- ✅ PostgreSQL database
- ✅ Go backend (with auto-migration & seeding)
- ✅ Next.js frontend

Then visit: **[http://localhost:3000](http://localhost:3000)**

**For more details, see [DOCKER.md](./DOCKER.md)**

Or use the convenience scripts:

```bash
# --- Linux / Mac ---
./start.sh up-build           # Start everything
./start.sh up-build frontend  # Start frontend only
./start.sh clean              # Reset everything (DB + Containers)

# --- Windows ---
start.bat up-build            # Start everything
start.bat up-build frontend   # Start frontend only
start.bat clean               # Reset everything (DB + Containers)
```

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend**

   ```bash
   cd backend
   ```

2. **Ensure PostgreSQL is running** (see Database section below)

3. **Setup environment**

   ```bash
   # .env file already configured with defaults
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=invoice_generator
   SERVER_PORT=8080
   JWT_SECRET=invoice_generator_secret_key_2026
   WEBHOOK_URL=http://localhost:9000/webhook
   ```

4. **Run the backend**

   ```bash
   go build -o invoice-generator .
   ./invoice-generator
   ```

   Server runs on `http://localhost:8080`

#### Frontend Setup

1. **Navigate to frontend**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run dev server**

   ```bash
   npm run dev
   ```

   Frontend runs on `http://localhost:3000`

## 🗄️ Database Setup

### PostgreSQL (Local)

Create the database:

```sql
CREATE DATABASE invoice_generator;
```

The backend will auto-migrate tables on first run.

### Docker (Recommended)

A `docker-compose.yml` can be created to spin up PostgreSQL:

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:latest
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: invoice_generator
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run:

```bash
docker-compose up -d
```

## 📚 API Documentation

### Authentication

**POST `/api/login`** (Public)

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response:

```json
{
  "token": "eyJ...",
  "role": "admin"
}
```

Demo Users:

- `admin` / `admin123` (role: admin)
- `kerani` / `kerani123` (role: kerani)

### Items Search

**GET `/api/items?code={kode}`** (Public)

Search items by code (case-insensitive, debounced from frontend).

Response:

```json
{
  "data": [{ "id": 1, "code": "ITEM001", "name": "Item One", "price": 10000 }],
  "count": 1
}
```

### Dashboard Stats

**GET `/api/stats`** (Public)

Returns summary statistics for the dashboard cards.

Response:

```json
{
  "total_invoices": 150,
  "today_revenue": 5000000,
  "recent_activity": [...]
}
```

### Invoice History

**GET `/api/invoices`** (Protected - JWT Required)

Returns a list of all historical invoices.

### Create Invoice

**POST `/api/invoices`** (Protected - JWT Required)

Header:

```
Authorization: Bearer <token>
```

Payload:

```json
{
  "invoice_number": "INV-123456",
  "sender_name": "John Doe",
  "sender_address": "123 Main St",
  "receiver_name": "Jane Smith",
  "receiver_address": "456 Oak Ave",
  "details": [
    {
      "item_id": 1,
      "quantity": 2,
      "price": 10000,
      "subtotal": 20000
    }
  ]
}
```

**⚠️ IMPORTANT (Zero-Trust Security):**

- Backend **ignores** client-sent `total_amount` and prices
- Backend **queries items table** to get real prices
- Backend **calculates totals** server-side
- Kerani role: prices are stripped **before** reaching backend
- Admin role: full payload sent

Response:

```json
{
  "id": 1,
  "invoice_number": "INV-123456",
  "total_amount": 20000,
  "details": [...]
}
```

## 🔐 Authentication Flow

1. User submits credentials on login page
2. Backend returns JWT token with `user_id` and `role`
3. Frontend stores token in JS-Cookie
4. Axios interceptor auto-injects `Authorization: Bearer <token>` header
5. On 401 response, token is cleared and user redirected to login

## 🎯 Key Features

### Backend (Go Fiber)

✅ **Zero-Trust Invoice API**

- Never trusts client-sent prices
- Queries items table for real prices
- Atomic transactions (rollback on failure)

✅ **JWT Authentication**

- Hardcoded demo users (admin, kerani)
- 24-hour token expiry
- Role-based access control

✅ **Automated Seeder**

- 10 dummy items loaded on first run
- Only runs if table is empty

✅ **Async Webhook**

- Goroutine sends POST to webhook URL after successful invoice creation
- Non-blocking operation

✅ **Database**

- PostgreSQL with GORM
- Auto-migration on startup
- Foreign key constraints

### Frontend (Next.js 14)

✅ **Dashboard & Statistics**

- Real-time performance metrics (Total Invoices, Today's Revenue)
- "Quick Action" cards for faster workflow
- Live "Recent Activity" feed

✅ **Multi-Step Wizard**

- Step 1: Client data entry (persisted)
- Step 2: Item search with debounce & race condition prevention
- Step 3: Review & print with role-based filtering

✅ **Anti-Hydration Strategy**

- Zustand `persist` middleware with client-only loading
- No "hydration failed" errors on refresh
- Persistent state across page navigations

✅ **Debounce & Race Condition Prevention**

- 500ms debounce on item search
- AbortController cancels pending requests
- Prevents duplicate API calls

✅ **Role-Based Payload Filtering**

- Kerani role automatically strips prices before submission
- Admin role sends full payload
- Implemented on client-side for transparency

✅ **Print-Optimized A4 Precision**

- **Compact Layout**: Fits 5-10 items per A4 page via aggressive spacing optimization.
- **Zero Browser Artifacts**: Suppresses browser-generated headers (URL/Date) via CSS `@page` resets.
- **Visual Stability**: Uses `break-inside-avoid` to prevent page splitting in critical sections (signatures).
- **Professional Branding**: Clean typography and grayscale-optimized borders.

✅ **Invoice History & Audit**

- Dedicated history page for tracking all generated invoices.
- Professional list view with status and revenue tracking.

## 📋 Wizard Flow

```
Login Page
   ↓
Step 1: Data Klien (Sender & Receiver) → Persisted
   ↓
Step 2: Data Barang (Items) → Debounced Search → Persisted
   ↓
Step 3: Review & Print → Role-Based Filtering → Submit → Webhook → Success
   ↓
Redirect to Home
```

**Persistence**: Refreshing on any step keeps data intact (Zustand localStorage).

## 🛠️ Development

### Backend Development

```bash
cd backend

# Build
go build -o invoice-generator .

# Run
./invoice-generator

# Or build & run
go run .
```

### Frontend Development

```bash
cd frontend

# Dev server (hot reload)
npm run dev

# Production build
npm run build
npm start

# Lint
npm run lint
```

## 🧪 Testing Workflow

1. **Start backend** (Terminal 1):

   ```bash
   cd backend && go run .
   ```

2. **Start frontend** (Terminal 2):

   ```bash
   cd frontend && npm run dev
   ```

3. **Open browser**: `http://localhost:3000`

4. **Login**:
   - Username: `admin` or `kerani`
   - Password: `admin123` or `kerani123`

5. **Step 1**: Fill in sender/receiver details

6. **Step 2**: Search items by code (e.g., "ITEM"), add to invoice

7. **Step 3**: Review, print, submit

8. **Verify**: Check backend console for webhook notification

## 🔍 Debugging Tips

### Backend

- Check `.env` file for database credentials
- Ensure PostgreSQL is running on port 5432
- Look for seeder output on startup
- Check webhook notifications in console

### Frontend

- Check browser DevTools Network tab for API calls
- Verify JWT in Application → Cookies → `token`
- Check for hydration errors in console
- Use React DevTools to inspect Zustand store

## 📦 Dependencies

### Backend (Go)

- **Fiber v3**: Fast HTTP framework
- **GORM v1.31**: ORM for PostgreSQL
- **JWT**: Token generation & validation
- **godotenv**: Environment variable loading

### Frontend (Node.js)

- **Next.js 14**: React framework (Pages Router)
- **TypeScript**: Type safety
- **TailwindCSS 3**: Utility-first CSS
- **Zustand 4**: State management
- **TanStack React Query v5**: Data fetching
- **Axios 1.6**: HTTP client
- **js-cookie 3**: Cookie management

## 📝 Environment Variables

### Backend (`.env`)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=invoice_generator
SERVER_PORT=8080
JWT_SECRET=invoice_generator_secret_key_2026
JWT_EXPIRY=24h
WEBHOOK_URL=http://localhost:9000/webhook
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

## 🎨 Design System

- **Color Palette**: Fleetify Logistics (Blue, Slate)
- **Typography**: Inter font
- **Components**: TailwindCSS utility-first
- **Spacing**: 8px base unit
- **Borders**: Subtle outline_variant with opacity
- **Shadows**: Tonal layering over drop shadows

## 🚨 Important Notes

- **Zero-Trust API**: Backend never trusts client prices
- **Hydration Safety**: Always use `useInvoiceStoreHydrated()` hook
- **Debounce**: 500ms delay on item search prevents excessive API calls
- **Role-Based**: Kerani role automatically filters sensitive data
- **Persistence**: State survives browser refresh via localStorage

## 📚 Further Reading

- [Backend README](./backend/README.md) - Backend-specific documentation
- [Frontend README](./frontend/README.md) - Frontend-specific documentation

## 📝 License

Private project - Fleetify Logistics Invoice Wizard

---

**Status**: Professional Platform Refactor ✅ | Dashboard & History ✅ | Print Optimization ✅ | Ready for Production

For questions or issues, refer to the individual README files or contact the Fleetify Engineering team.
