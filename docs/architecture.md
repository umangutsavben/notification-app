# Architecture Overview

This platform uses a modular monolith architecture. 

## Components

1. **Mobile Applications**
   - Built with Flutter (Android & iOS).
   - One-way communication app (Users can only consume notifications).
   - Authenticates via OTP.

2. **Backend API**
   - Built with Node.js, Express, and TypeScript.
   - Provides RESTful endpoints for Mobile and Admin Dashboard.
   - Contains core business logic.

3. **Admin Dashboard**
   - Built with React, Vite, and TypeScript.
   - Used by administrators to manage users and send notifications.

4. **Database**
   - PostgreSQL, accessed via Prisma ORM.

5. **Queue & Caching**
   - Redis is used for caching, rate limiting, and BullMQ task queues.
   - Workers will process notifications asynchronously to allow bulk messaging (up to 10k users) without blocking the API.

## Scalability
- The backend is stateless (JWT authentication).
- Heavy lifting (FCM/APNs delivery) is offloaded to Redis-backed workers.
- The PostgreSQL database handles relationships and delivery tracking, but read-heavy workloads (like notification lists) can be cached in Redis in the future.
