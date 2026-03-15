# FitTrack API Server

Backend for the FitTrack app. Handles user registration, login, and workout storage.

## Setup

```bash
cd server
npm install
npm start
```

The API runs at `http://localhost:4000`. For development with auto-restart:

```bash
npm run dev
```

## Data storage

- **Users**: Stored in `server/data/users.json` (id, email, password hash).
- **Workouts**: Stored in `server/data/workouts.json` (per-user).

Passwords are hashed with bcrypt; never stored in plain text.

## Environment

- `PORT` – Server port (default: 4000).
- `JWT_SECRET` – Secret for signing JWTs (set in production).

## API

- `POST /api/auth/register` – Body: `{ "email", "password" }`. Returns `{ token, user }`.
- `POST /api/auth/login` – Body: `{ "email", "password" }`. Returns `{ token, user }`.
- `GET /api/workouts` – Header: `Authorization: Bearer <token>`.
- `POST /api/workouts` – Header: `Authorization: Bearer <token>`, body: workout payload.
- `PUT /api/workouts/:id` – Update workout.
- `DELETE /api/workouts/:id` – Delete workout.
