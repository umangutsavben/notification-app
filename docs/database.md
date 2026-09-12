# Database Schema

The platform relies on PostgreSQL, managed via Prisma.

## Core Tables

- `User`: End-users receiving notifications (authenticated via Phone/OTP).
- `Admin`: Administrators managing the platform.
- `Device`: Mobile devices registered by users. Stores FCM and APNs tokens.
- `Notification`: A single notification campaign (sent to ALL, SPECIFIC, or TOPIC).
- `UserNotification`: Join table linking a user to a received notification. Tracks `isRead` status.
- `NotificationDelivery`: Tracks actual push delivery attempts and status from FCM/APNs.
- `AuditLog`: Action tracking for admins.

Refer to `backend/prisma/schema.prisma` for the source of truth.
