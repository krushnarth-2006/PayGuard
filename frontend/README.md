# PayGuard Frontend

Professional React/Vite frontend for **PayGuard — Real-Time Digital Payment Fraud Detection**.

## Product goal

Provide two clearly separated experiences:

- **Customer Portal** — check a payment, see the fraud-risk assessment, review transaction history, and view security status.
- **Admin Console** — monitor transactions, risk analytics, API performance, and model drift.

## Current frontend capabilities

- Separate customer and administrator login screens
- Role-based protected routes and navigation
- Customer transaction checking workflow with analyzing state and result screen
- Persistent customer transaction history using browser storage for standalone development
- Search, filters, sorting, and transaction detail drawer
- Admin transaction table, analytics, performance, and drift views
- Notifications, theme toggle, responsive layout, and mobile navigation
- API-ready data layer with a demo mode that works without FastAPI

## Demo accounts

Customer: `customer@payguard.com` / `customer123`

Admin: `admin@payguard.com` / `admin123`

These credentials are frontend demo authentication only and must not be used as production authentication.

## Run independently

```bash
npm install
npm run dev
```

## Real FastAPI integration

The frontend can switch from demo scoring to the existing PayGuard FastAPI service without changing the UI.

Create `.env` from `.env.example` and set:

```env
VITE_USE_REAL_API=true
VITE_API_URL=http://127.0.0.1:8000
```

Then restart Vite.

The backend request/response contract must match the existing `/predict` endpoint. The frontend data layer is intentionally isolated in `src/data/mockApi.js` so this integration can be changed in one place.

## Build

```bash
npm run build
```

## Structure

```text
src/
├── components/
├── context/
├── data/
├── pages/
│   ├── auth/
│   ├── customer/
│   └── admin/
├── App.jsx
├── index.css
└── main.jsx
```
