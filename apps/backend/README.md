# Gimsoi Project Tracker - Backend API

## Summary
This backend works as a secure, scalable foundation for the Gimsoi Project Tracker. It implements **Role-Based Access Control (RBAC)** to ensure strict data security—preventing unauthorized access (e.g., Interns deleting tasks or Clients creating them). With enterprise-grade authentication (secure cookies, JWTs, password resets) and a unified server architecture, it allows the frontend team to build confident, permission-aware UIs immediately.

---

## Setup & Run

### 1. Environment Variables
Create a `.env` file in `apps/backend/` with the following:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/gimsoi_db"
JWT_SECRET="your_super_secret_key"
CLIENT_URL="http://localhost:5173" # Frontend URL for CORS
GMAIL_USER="your-email@gmail.com"
GMAIL_PASSWORD="your-app-password"
```

### 2. Installation
```bash
cd apps/backend
npm install
npx prisma generate  # Critical: Generates the DB client with 'role' field
```

### 3. Run Server
```bash
npm run dev
# OR
node server.js
```
Server runs on `http://localhost:5000`.

---

## API Reference

**Base URL**: `http://localhost:5000/api`

### Authentication (`/auth`)

| Method | Endpoint | Description | Request Body | Success Response |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/signup` | Register new user | `{ "email": "...", "password": "...", "fullName": "...", "role": "ADMIN|PM|INTERN|CLIENT" }` | `{ "success": true, "user": { "id": "...", "role": "..." }, "token": "..." }` |
| **POST** | `/login` | Login user | `{ "email": "...", "password": "..." }` | `{ "success": true, "user": { ... }, "token": "..." }` |
| **POST** | `/logout` | Clear session | N/A | `{ "success": true, "message": "Logged out successfully" }` |
| **GET** | `/check-auth` | Get current user | N/A (Requires Token) | `{ "success": true, "user": { ... } }` |
| **POST** | `/forgot-password` | Request reset link | `{ "email": "..." }` | `{ "success": true, "message": "Password reset link sent..." }` |
| **POST** | `/reset-password/:token` | Set new password | `{ "password": "..." }` | `{ "success": true, "message": "Password reset successful" }` |

> **Note**: Authentication uses **HTTP-Only Cookies**. The `token` is also returned in the JSON body for flexibility (e.g., mobile apps or testing).
> **Headers**: For `/check-auth` and RBAC routes, if cookies aren't used, send header: `Authorization: Bearer <token>`.

### Tasks (`/tasks`)


| Method | Endpoint | Permissions | Request Body | Success Response |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | **All Roles** | N/A | `{ "message": "Viewing progress: Task list retrieved..." }` |
| **POST** | `/` | **ADMIN, PM** | `{ "title": "...", "description": "..." }` | `{ "message": "Task created successfully." }` |
| **PUT** | `/:id` | **ADMIN, INTERN** | `{ "status": "..." }` | `{ "message": "Task 123 updated successfully." }` |
| **DELETE** | `/:id` | **ADMIN** | N/A | `{ "message": "Task 123 deleted successfully." }` |

### Error Responses
All endpoints return standard error formats:
- **400 Bad Request**: `{ "success": false, "message": "Invalid input..." }`
- **401 Unauthorized**: `{ "success": false, "message": "Authentication required..." }`
- **403 Forbidden**: `{ "success": false, "message": "Access denied. Role 'CLIENT' does not have 'CREATE_TASK' permission." }`
