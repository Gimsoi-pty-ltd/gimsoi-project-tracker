# Backend Documentation & Learning Methods

**Date:** 2026-02-18
**Project:** Gimsoi Project Tracker (Backend)

---

## 1. Understand Your Own Codebase

### Where are users stored?
**Answer:** Users are stored in a **PostgreSQL** database.
- **Evidence:** The application uses **Prisma ORM** with a `postgresql` provider defined in `apps/backend/prisma/schema.prisma` (lines 9-11).
- **Schema:** The `User` model is defined in `schema.prisma` (lines 13-29) with fields like `id`, `email`, `password`, `fullName`, `role` (default: "INTERN"), etc.

### How is password hashed?
**Answer:** Passwords are hashed using **bcryptjs** with a salt round of **10**.
- **Evidence:** In `apps/backend/controllers/auth.controller.js`:
  - **Signup:** `const hashedPassword = await bcryptjs.hash(password, 10);` (line 27)
  - **Login:** `const isPasswordValid = await bcryptjs.compare(password, user.password);` (line 110)

### Where is token created?
**Answer:** Tokens are created in a utility function `generateTokenAndSetCookie`.
- **Location:** `apps/backend/utils/generateTokenAndSetCookie.js`
- **Mechanism:** It generates a **JWT (JSON Web Token)** using `jsonwebtoken`.
  - **Payload:** `{ userId, role }`
  - **Expiration:** 7 days
  - **Storage:** The token is sent to the client as an **HTTP-only, Secure cookie** named `token`.

### How are roles enforced?
**Answer:** Roles are persisted in the database and enforced via **JWT** and **Middleware**.
- **Definition:** Roles (`ADMIN`, `PM`, `INTERN`, `CLIENT`) are defined in `apps/backend/Roles/roles.js`.
- **Permissions:** Mapped in `apps/backend/permissions/permissions.js`.
- **Enforcement:**
  1. **Storage:** The `User` model in `schema.prisma` has a `role` field.
  2. **Token generation:** When a user logs in, their `role` is embedded in the JWT payload (`utils/generateTokenAndSetCookie.js`).
  3. **Verification:** The `verifyToken` middleware decodes the JWT and attaches `req.userRole = decoded.role` to the request object.
  4. **Authorization:** The `authorize` middleware checks `req.userRole` against the required permissions for the route.
  - **Note:** The `authorize` middleware has a fallback to check `req.headers['x-user-role']`, but because `verifyToken` is applied first on protected routes, the secure `req.userRole` from the token is used.

### What happens when login fails?
**Answer:** The API returns a **400 Bad Request** status code with a generic error message.
- **Code:** `apps/backend/controllers/auth.controller.js` (lines 98-136)
- **Scenarios:**
  - **User not found:** Returns 400 with `{ message: "Invalid credentials" }`.
  - **Invalid password:** Returns 400 with `{ message: "Invalid credentials" }`.
- **Security Note:** Using the same message for both errors is a best practice to prevent user enumeration attacks.

---

## 2. Learn Basic Concepts (Research Topics)

### CRUD Testing

**What is integration testing?**
Integration testing verifies that different modules or services used by your application work well together. In the context of your backend, it involves testing the interaction between your API routes, controllers, and the actual database (Prisma + PostgreSQL) to ensure the data flows correctly. Unlike unit tests, integration tests do not mock external dependencies like the database; they test the "real" path.

**Difference between unit vs integration?**
- **Unit Testing:** Tests a small, isolated piece of logic (e.g., a single function) in isolation. External dependencies are mocked (simulated). It is fast and precise but doesn't guarantee the system works as a whole.
- **Integration Testing:** Tests combined parts of the application to determine if they function correctly together. It is slower but provides higher confidence that the feature works for the user.

**Why test full lifecycle?**
Testing the full lifecycle (e.g., Create -> Read -> Update -> Delete) ensures that state changes are persisted and reflected correctly across subsequent operations. It catches bugs where an operation might succeed superficially (return 200 OK) but corrupt data or fail to update the state for the next step.

### Authentication Basics

**Password hashing (bcrypt/argon2 conceptually)**
- **Concept:** Storing plain-text passwords is a major security risk. Hashing converts a password into a fixed-length string of characters that cannot be reversed.
- **Salt:** A random value added to the password before hashing. This prevents "Running Rainbow Table" attacks (pre-computed hashes) and ensures that two users with the same password have different hashes.
- **Work Factor:** Algorithms like bcrypt are designed to be "slow" (computationally expensive) to make brute-force attacks impractical for attackers.

**What is JWT?**
**JSON Web Token (JWT)** is a compact, URL-safe means of representing claims to be transferred between two parties.
- **Structure:** `Header.Payload.Signature`
- **Usage:** After login, the server gives the client a JWT. The client sends this token with subsequent requests (usually in a header or cookie). The server can verify the 'Signature' to know the user is who they claim to be without querying the database for a session every time (stateless auth).

**What is a session?**
A **Session** is a stateful approach to auth. The server creates a "session ID" stored in the database (or memory like Redis) and sends just the ID to the browser (cookie). On every request, the server looks up the ID in its storage to retrieve user details.
- **Difference:** JWT is stateless (info inside token), Session is stateful (info on server).

**401 vs 403 difference**
- **401 Unauthorized:** "I don't know who you are." (You are not logged in / Invalid token).
- **403 Forbidden:** "I know who you are, but you are not allowed to do this." (You are logged in, but lack the necessary permission/role).

### Basic Reliability

**What is latency?**
Latency is the time delay between a user's action (clicking a button) and the application's response. It is usually measured in milliseconds (ms). Low latency = fast.

**What is p95?**
**p95 (95th percentile)** is a statistical measure of latency. It means "95% of requests are faster than this value". It is a better metric than "Average" because it ignores outliers but still accounts for the experience of the vast majority of users, including those on slightly slower connections.

**What is concurrency?**
Concurrency is the ability of your system to handle multiple tasks or requests at the same time (strictly speaking, managing their execution during overlapping time periods). In Node.js, this is handled via the event loop.

**What causes DB bottlenecks?**
- **Slow Queries:** Missing indexes, selecting too much data (`SELECT *`), or complex joins.
- **Connection Limits:** Running out of open connections to the database.
- **Locks:** One transaction waiting for another to finish editing a row.
- **Resources:** CPU or Memory saturation on the DB server.

**What is connection pooling?**
Opening a new connection to a database is expensive (slow). **Connection Pooling** maintains a cache of open, reusable connections. When an API request needs the DB, it borrows an existing connection, uses it, and returns it to the pool instead of closing it. This drastically improves performance for high-traffic apps.


## Environment Variables

This backend uses environment variables for sensitive configuration such as API keys.

### Required Variables

Create a `.env` file in the `apps/backend` directory (same level as `package.json`) and define the following:

```env
GOOGLE_API_KEY=your_google_api_key_here
 
 ## SETUP INSTRUCTIONS 
 copy the example file:
 bash
 cp .env.example .env

 2 . add your own google API KEY TO THE .env file
 3.run backend as normal