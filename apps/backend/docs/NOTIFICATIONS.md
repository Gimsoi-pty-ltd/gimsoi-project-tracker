# Notifications API Documentation

## Overview
The Notifications API allows authenticated users to receive, inspect, and acknowledge notifications. All operations are strictly scoped to the authenticated user's session with rate limiting applied to prevent abuse.

## Endpoints

### 1. `GET /api/notifications`
- **Description**: Returns up to 50 of the latest notifications for the current user.
- **Auth**: Required (`verifyToken`).
- **Response**: `200 OK` with `{ success: true, data: [...] }`.

### 2. `PATCH /api/notifications/:id/read`
- **Description**: Marks a single notification owned by the current user as read.
- **Auth**: Required (`verifyToken`).
- **Responses**:
  - `200 OK`: `{ success: true, message: "Marked as read" }`
  - `404 Not Found`: If the notification does not exist or belongs to another user.

### 3. `PATCH /api/notifications/read-all`
- **Description**: Marks all unread notifications of the current user as read (`isRead: true`).
- **Auth**: Required (`verifyToken`).
- **Response**: `200 OK` with `{ success: true, message: "All notifications marked as read" }`.

## Security & Access Isolation
- **Tenant Isolation**: Queries strictly filter by `where: { userId: req.user.id }`.
- **IDOR Protection**: Modifying another user's notification returns `404 Not Found`.
- **Rate Limiting**: Limited to 60 requests/minute per IP (`429 Too Many Requests`).

## Testing Guide

Run the dedicated test suite using Playwright:

```bash
# Navigate to the backend directory
cd apps/backend

# Execute notification tests
npm run test:api -- tests/api/notification.spec.js
```
