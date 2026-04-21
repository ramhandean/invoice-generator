# Frontend - Invoice Generator

A Next.js 14 (Pages Router) + TypeScript + TailwindCSS frontend for the Multi-Step Invoice Generator system.

## Project Structure

```
frontend/
├── pages/
│   ├── _app.tsx              # App wrapper with hydration protection
│   ├── _document.tsx         # HTML document setup
│   ├── index.tsx             # Root page (redirects to login/wizard)
│   ├── login.tsx             # Login page with JWT handling
│   └── wizard/
│       ├── step1.tsx         # Client data entry
│       ├── step2.tsx         # Item/goods search with debounce
│       └── step3.tsx         # Review & print with role-based filtering
├── store/
│   └── invoiceStore.ts       # Zustand store with localStorage persistence
├── lib/
│   └── axiosInstance.ts      # Axios with JWT interceptors
├── utils/
│   ├── jwt.ts                # JWT decoding utilities
│   ├── payloadFilter.ts      # Role-based payload filtering (Kerani strips prices)
│   ├── debounce.ts           # Debounce hook
│   ├── fetchWithAbort.ts     # Fetch with AbortController
│   └── index.ts              # Utilities export
├── components/               # Reusable React components (future)
├── styles/
│   └── globals.css           # TailwindCSS + global styles
├── public/                   # Static assets
├── .env.local                # Environment variables
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # TailwindCSS configuration
├── postcss.config.js         # PostCSS configuration
└── .eslintrc.json            # ESLint configuration
```

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm/yarn

### Install Dependencies

```bash
cd frontend
npm install
```

### Environment Variables

Create/verify `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

## Development

### Start Dev Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Key Features

### 🔐 Authentication Flow

- Login page with hardcoded demo credentials (admin/admin123, kerani/kerani123)
- JWT stored in JS-Cookie (secure, httpOnly not possible due to interceptor needs)
- Axios auto-injects `Authorization: Bearer <token>` header
- 401 responses trigger automatic logout & redirect to login

### 🔄 Anti-Hydration Strategy

- Zustand store with `persist` middleware
- Custom `useInvoiceStoreHydrated()` hook delays rendering until hydration complete
- `useEffect` flag ensures localStorage only loads on client
- **No hydration mismatch errors** when refreshing browser

### 📊 3-Step Wizard

**Step 1: Data Klien**

- Sender & receiver information form
- Persisted in Zustand store
- Progress saved across page refreshes

**Step 2: Data Barang**

- Item search with 500ms debounce
- **AbortController** cancels previous requests to prevent race conditions
- Add/remove items from invoice
- Quantities configurable

**Step 3: Review & Print**

- Invoice preview with formatted data
- Print-optimized layout with `@media print` classes
- Role-based payload filtering:
  - **Admin**: sends full payload (prices included)
  - **Kerani**: automatic removal of `price` and `subtotal` fields before submission
- Submit button triggers async webhook notification from backend

### ⚡ Debounce & Race Condition Prevention

In `Step 2`, item search:

- 500ms debounce before API call (via `useDebounce` hook)
- AbortController cancels pending requests if user types quickly
- Prevents duplicate requests and race conditions

### 🎨 Design System

- TailwindCSS with custom color tokens from Fleetify design system
- Consistent spacing, typography, and color palette
- Print-optimized layout in Step 3

## Utilities

### `useInvoiceStoreHydrated()`

Safe access to Zustand store on client only:

```typescript
const store = useInvoiceStoreHydrated();
if (!store.isHydrated) return null; // Prevent SSR mismatch
```

### `useDebounce(callback, delay)`

Debounce any function call:

```typescript
const debouncedSearch = useDebounce(performSearch, 500);
debouncedSearch(userInput);
```

### `filterPayloadByRole(payload)`

Automatically strips price/total for Kerani role:

```typescript
let payload = { total_amount: 5000, details: [...] };
payload = filterPayloadByRole(payload); // Removes prices if role === 'kerani'
```

### `decodeJWT(token)` / `getRoleFromToken(token)`

Client-side JWT reading (no verification):

```typescript
const role = getRoleFromToken(token); // 'admin' or 'kerani'
```

## API Integration

All API calls use `axiosInstance` from `lib/axiosInstance.ts`:

```typescript
import axiosInstance from "@/lib/axiosInstance";

// JWT auto-injected, 401 redirects to login
const response = await axiosInstance.post("/invoices", payload);
```

## Print Layout

Step 3 includes CSS for print:

```css
@media print {
  .print:hidden {
    display: none;
  } /* Hide buttons */
  .print:p-0 {
    padding: 0;
  } /* Remove padding */
  .print:text-lg {
    font-size: 1.125rem;
  } /* Scale text */
}
```

Print-optimized table and invoice format for professional output.

## Troubleshooting

### "Hydration failed" Error

- Check `useInvoiceStoreHydrated()` is used for store access
- Ensure `useEffect` sets `isHydrated` before rendering store data

### Debounce Not Working

- Verify `useDebounce` is called with correct delay (default 500ms)
- Check AbortController cancellation in console

### JWT Not Being Sent

- Verify Cookies are set (`Cookies.get('token')` in browser console)
- Check Axios interceptor in `lib/axiosInstance.ts`
- Look for 401 errors if token is invalid

### Role-Based Filtering Not Working

- Ensure JWT is valid and contains `role` claim
- Check payload before submission in browser DevTools
