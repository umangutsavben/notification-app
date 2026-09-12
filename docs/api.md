# API Structure

All APIs are prefixed with `/api/v1`.

## Public Routes
- `GET /health` - Service health check

## Mobile App Routes (Authenticated via User JWT)
- `POST /auth/send-otp` - Request login OTP
- `POST /auth/verify-otp` - Verify OTP and get JWT
- `POST /devices` - Register mobile device push tokens
- `GET /notifications` - Get paginated list of user notifications
- `POST /notifications/:id/read` - Mark notification as read

## Admin Dashboard Routes (Authenticated via Admin JWT)
- `POST /admin/login` - Admin login
- `GET /admin/users` - List users
- `POST /admin/notifications` - Send a notification (push to queue)
- `GET /admin/notifications` - View sent campaigns
- `GET /admin/notifications/:id/stats` - View delivery statistics

*Note: These are planned endpoints. Check the implementation for exact details.*
