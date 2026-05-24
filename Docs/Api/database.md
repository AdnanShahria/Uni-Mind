# Database API Integration Documentation

This document describes the database connection patterns, RESTful PostgreSQL mapping structures, and credential variables integrated inside the **UniMind Database Layer**.

---

## 1. System Credentials & Variables

All database and cloud storage variables are loaded securely from `.dev.vars` inside Wrangler during local development execution:

```bash
# PostgreSQL direct DB URL
DATABASE_URL="postgresql://postgres:[password]@db.mbqiepxaqseltvkhaxoy.supabase.co:5432/postgres"

# Supabase REST and Auth endpoints
SUPABASE_URL="https://mbqiepxaqseltvkhaxoy.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_..."
```

---

## 2. Supabase PostgREST Architecture

Supabase provides an automated REST API that maps every table inside the `public` schema of your database directly to HTTP endpoints.

For example, when the `users` table is defined inside the Postgres database:
* **Table Target**: `public.users` (created via [users.sql](file:///c:/Users/Adnan/Desktop/UniMind/database/schema/users.sql))
* **REST Target URL**: `${SUPABASE_URL}/rest/v1/users`
* **Authentication Headers**:
  ```http
  apikey: SUPABASE_ANON_KEY
  Authorization: Bearer SUPABASE_ANON_KEY
  ```

---

## 3. Auth API Specifications (HTTPS)

Authentication and registration operations execute securely against Supabase's native identity gateway over port `443` (HTTPS):

### A. Signup API
Registers a new user record inside the Supabase `auth.users` system database table.

* **Target URL**: `${SUPABASE_URL}/auth/v1/signup`
* **Request Method**: `POST`
* **Payload Mappings**:
  ```json
  {
    "email": "user@university.edu",
    "password": "userpassword",
    "options": {
      "data": {
        "name": "User Name",
        "institution": "Stanford University",
        "major": "Quantum Computing",
        "role": "PhD Candidate"
      }
    }
  }
  ```
* **PostgreSQL Synchronization**: When registered successfully, Supabase Auth fires a trigger to copy these credentials and the new user's UUID into our public `users` table. The trigger code is located in the [users.sql](file:///c:/Users/Adnan/Desktop/UniMind/database/schema/users.sql) schema file.

---

### B. Login / Session Token API
Authorizes existing profiles and returns JWT (JSON Web Tokens) to track sessions.

* **Target URL**: `${SUPABASE_URL}/auth/v1/token?grant_type=password`
* **Request Method**: `POST`
* **Payload Mappings**:
  ```json
  {
    "email": "user@university.edu",
    "password": "userpassword"
  }
  ```
* **Response Details**:
  * Returns an `access_token` JWT containing the user identity scope.
  * Returns a `refresh_token` to maintain session persistence.
  * Returns the user metadata fields inside `user.user_metadata`.

---

## 4. Storage Integration (Cloudflare R2 Bindings)

Apart from Postgres, the application binds files and annotations to **Cloudflare R2 Bucket** storage:
* **Account ID**: `57831cda08ced02f17c00daa4e28809a`
* **Bucket Name**: `unimind`
* **Credential Variables**: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` loaded dynamically for object storage read/write calls.
