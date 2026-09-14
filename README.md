# BillSync — Billing & Recurring Payment System

A full-stack subscription billing platform with plan management, usage-based overage tracking, automated recurring billing, and invoice generation. Built as a two-role system — regular users subscribe to plans and track their usage; admins manage plans, features, and billing operations across all accounts.

**Live app:** https://billing-recurring-payment-system.vercel.app
**API:** https://billing-recurring-payment-system.onrender.com

> Hosted on free tiers (Render backend, Vercel frontend, Supabase database) — the backend may take up to ~50 seconds to respond on first load after a period of inactivity.

## Tech Stack

**Backend**
- Node.js / Express 5
- PostgreSQL via Sequelize ORM (hosted on Supabase)
- JWT authentication via httpOnly cookies
- bcrypt password hashing
- Multer for file uploads (profile photos)
- Nodemailer (optional email notifications)

**Frontend**
- React 19 + Vite
- React Router
- Tailwind CSS
- Axios

## Features

### Auth
- Signup / login / logout with JWT stored in an httpOnly cookie
- Role-based access control (`user` / `admin`)

### User side
- Browse available plans and subscribe
- View and cancel active subscriptions
- Track per-feature usage against plan limits
- View billing summary, invoices, and transaction history
- Manage profile (details, password, profile photo)

### Admin side
- Dashboard with billing/usage stats across all accounts
- Manage features (create, edit, delete, set unit pricing and limits)
- Manage plans (create, edit, delete, attach features)
- View all users and their subscriptions
- View and manage all subscriptions
- Trigger recurring billing runs for due accounts
- View, filter, and update invoice status across all users
- Record usage on behalf of a subscription

## Project Structure

```
.
├── backend/
│   ├── config/         # Sequelize DB config
│   ├── constants/       # Shared constants (roles, etc.)
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth middleware, file upload
│   ├── models/          # Sequelize models
│   ├── routes/          # Express routers (auth, user, admin)
│   ├── utils/
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/          # Axios instance
    │   ├── pages/
    │   │   ├── admin/    # Admin-only pages
    │   │   └── user/     # Authenticated user pages
    │   └── App.jsx        # Route definitions
    └── vercel.json        # SPA rewrite rule for client-side routing
```

## Local Setup

### Prerequisites
- Node.js
- A PostgreSQL database (e.g. a free [Supabase](https://supabase.com) project)

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:
```
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_HOST=
DB_PORT=5432
DB_DIALECT=postgres
JWT_SECRET=
JWT_EXPIRES_IN=1h
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
EMAIL_ENABLED=false
```

> If connecting to Supabase, use the **session pooler** connection details (Project → Connect → Session pooler) rather than the direct connection — the direct connection resolves to IPv6, which some networks block.

```bash
npm run dev
```

The server syncs the database schema automatically on start (`sequelize.sync({ alter: true })`) and runs on `http://localhost:3001` by default.

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:
```
VITE_API_URL=http://localhost:3001
```

```bash
npm run dev
```

Runs on `http://localhost:5173` by default.

### Creating an admin account

There's no admin signup flow by design. To promote an account:
1. Sign up normally through the app.
2. In Supabase → Table Editor → `users` table, change that row's `role` column from `user` to `admin`.
3. Log out and back in on the app.

## Deployment Notes

- **Backend (Render):** free web service, root directory `backend`, build `npm install`, start `npm start`. Requires `NODE_ENV=production` and `CLIENT_URL` set to the deployed frontend origin (for CORS).
- **Frontend (Vercel):** root directory `frontend`, framework preset Vite. Requires `VITE_API_URL` pointing to the deployed backend. `vercel.json` includes a rewrite rule so client-side routes don't 404 on refresh.
- **Cross-domain cookies:** since frontend and backend are on different domains in production, auth cookies are set with `sameSite: "none"` and `secure: true` when `NODE_ENV=production`.
- **Known limitation:** profile photo uploads are stored on local disk via Multer. Render's free tier has an ephemeral filesystem, so uploaded photos do not persist across redeploys/restarts.
