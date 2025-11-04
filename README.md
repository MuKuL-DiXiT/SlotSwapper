# SlotSwapper

SlotSwapper is a peer-to-peer time-slot swapping app (Full Stack Intern technical challenge).

This workspace contains:
- `backend/` — Express + MongoDB API
- `frontend/` — Next.js UI

IMPORTANT: For local development, run the backend on port 4000 and the frontend on port 3000.

Quick start
1. Backend

```bash
cd backend
npm install
cp .env.example .env    # edit .env if desired
npm run dev
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

API
- POST /api/auth/signup — body: { name, email, password }
- POST /api/auth/login — body: { email, password }
- POST /api/events — create event (protected)
- GET /api/events/mine — get my events (protected)
- PUT /api/events/:id — update my event (protected)
- DELETE /api/events/:id — delete my event (protected)
- GET /api/events/swappable — get swappable slots from other users (protected)
- POST /api/swap-request — create swap request: { myEventId, theirEventId } (protected)
- GET /api/swap-requests — list incoming/outgoing (protected)
- POST /api/swap-response/:requestId — respond: { accept: true|false } (protected)

Notes and assumptions
- MongoDB connection string is taken from `.env` (see `.env.example`).
- JWT is used for authentication and sent as `Authorization: Bearer <token>` header.
- The frontend calls the backend directly at `http://localhost:4000` (or use `NEXT_PUBLIC_API_URL` to change).
- The backend enables CORS (currently permissive) so the frontend can call APIs across origins. If you deploy, set `NEXT_PUBLIC_API_URL` to your backend's URL and restrict CORS origins in `backend/src/index.js` or `src/config/db.js` as appropriate.

Next steps / TODO
- Add integration tests for swap logic
- Add docker-compose for simplified local dev
