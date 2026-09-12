# Development Guide

## Environment Variables
Always copy `.env.example` to `.env` before running components locally.

## Docker Infrastructure
The platform relies on PostgreSQL and Redis for local development.
```bash
docker-compose up -d
```

## Backend (Node.js)
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

## Admin Dashboard (React/Vite)
```bash
cd admin-dashboard
npm install
npm run dev
```

## Mobile (Flutter)
```bash
cd mobile
flutter pub get
flutter run
```
