# Notification Platform

A highly scalable, production-ready notification communication platform built to handle 10,000+ users.

## Architecture

This system follows a modular monolith architecture with a worker-based queue processing system to ensure scalability.

- **Mobile:** Flutter (Android & iOS)
- **Backend:** Node.js (Express), TypeScript, Prisma ORM
- **Database:** PostgreSQL
- **Queue & Cache:** Redis + BullMQ (Placeholder for now)
- **Admin Dashboard:** React, Vite, TypeScript

## Repository Structure

```
notification-platform/
├── backend/            # Node.js backend (Express + TypeScript)
├── admin-dashboard/    # React admin dashboard (Vite + TS)
├── mobile/             # Flutter mobile application
├── docs/               # System documentation
├── docker-compose.yml  # Local development infrastructure
└── README.md           # This file
```

## Local Setup

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Flutter SDK

### Running Infrastructure (PostgreSQL & Redis)
```bash
docker-compose up -d
```

### Running Backend
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

### Running Admin Dashboard
```bash
cd admin-dashboard
npm install
npm run dev
```

### Running Mobile App
```bash
cd mobile
flutter pub get
flutter run
```

## Environment Variables

Check the `.env.example` file in the `backend/` directory for the required configuration.
