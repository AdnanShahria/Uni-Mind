# Backend API worker Documentation

This document describes the secure backend API server routes, middleware CORS configurations, database integration, and automatic offline fallback layers running inside the **UniMind API Worker**.

---

## 1. Primary Worker Component
* **Source Path**: [api/src/index.ts](file:///c:/Users/Adnan/Desktop/UniMind/api/src/index.ts)
* **Environment Runtime**: Cloudflare Workers (V8 Edge Sandbox Engine)
* **Default Port**: `8787` (started via `npm run dev --workspace=api` or concurrently via `npm run dev:all`)

---

## 2. Server Routing & HTTP Methods

| Endpoint | HTTP Method | Description | Authentication |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | Health status and environment environment config verify check. | None |
| `/status` | `GET` | Verbose system configuration review (Postgres/Supabase presence). | None |
| `/auth/register` | `POST` | Processes and registers an academic user profile. | None |
| `/auth/login` | `POST` | Authorizes an existing user profile against database tokens. | None |

---

## 3. CORS Policies (Cross-Origin Resource Sharing)

The worker automatically enables wide CORS parameters to facilitate local development fetch calls from your Vite client port (`5173`):
* `Access-Control-Allow-Origin`: `*` (Accepts all origins for local sandbox access)
* `Access-Control-Allow-Methods`: `GET, HEAD, POST, OPTIONS`
* `Access-Control-Allow-Headers`: `Content-Type, apikey, Authorization`
* `OPTIONS` Pre-flight: Responds instantly with `204 No Content` containing the above CORS headers.

---

## 4. Endpoints Specification

### A. Health & Config Verification (`GET /status` or `GET /`)
Confirms active connection state and environment variables presence.

* **Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "workspace": "unimind-api",
    "timestamp": "2026-05-24T12:00:00.000Z",
    "configuration": {
      "databaseUrlPresent": true,
      "supabaseUrlPresent": true,
      "supabaseAnonKeyPresent": true,
      "r2BucketNamePresent": true,
      "openaiApiKeyPresent": false
    }
  }
  ```

---

### B. User Registration (`POST /auth/register`)
Dispatches a secure HTTPS request to the Supabase database.

* **Server Validation**: Required parameters are parsed: `email, password, name`.
* **Execution Flow**:
  1. **Supabase Path**: Sends a `POST` request to `SUPABASE_URL/auth/v1/signup` attaching the `SUPABASE_ANON_KEY` as client key headers. Custom academic inputs are written inside `options.data` to map metadata.
  2. **Success Route**: If Supabase registers the user successfully, returns `200 OK` with user specs.
  3. **Error Route**: If Supabase responds with a specific constraint error (e.g., email already exists), returns the corresponding HTTP status and error text (e.g., `400` with `{ error: "User already exists" }`).
  4. **Fallback Route**: If a connection/network exception is thrown (DNS address failure or network offline), catches the block, logs a warning, and writes the credentials securely inside an in-memory `mockUsers` Map. Returns `{ success: true, message: "Registered... in local fallback database", ... }`.

---

### C. User Authentication (`POST /auth/login`)
Authorizes accounts against database session keys.

* **Server Validation**: Required parameters are checked: `email, password`.
* **Execution Flow**:
  1. **Supabase Path**: Sends a `POST` request to `SUPABASE_URL/auth/v1/token?grant_type=password`.
  2. **Success Route**: If authorized, extracts the session token and user profile metadata, returning `200 OK`.
  3. **Credentials Check**: If Supabase rejects the password with `invalid_grant`, it checks if the email exists in the local fallback map. If not, rejects the attempt with `401 Unauthorized` `{ error: "Invalid email or password" }`.
  4. **Fallback Route**: If Supabase is offline/unreachable due to network failure, falls back to look up credentials inside the local `mockUsers` Map. If the password matches, returns `200 OK`. Otherwise, rejects with `401`.

---

## 5. Mock Fallback Database Design

To ensure an robust development environment, a local backup store is initialized inside the Worker sandbox:
```typescript
const mockUsers = new Map<string, any>();
```
This map exists in the server memory space and stores active signup records dynamically. Even if the external Supabase server is completely down, signups and subsequent logins continue to validate successfully!
