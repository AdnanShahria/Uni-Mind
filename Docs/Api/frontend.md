# Frontend Auth API Documentation

This document specifies the frontend authentication client pipelines, input validations, state behaviors, and server connection triggers integrated inside the **UniMind Frontend** application.

---

## 1. Primary Auth Client Component
* **Component Path**: [AuthPage.tsx](file:///c:/Users/Adnan/Desktop/UniMind/frontend/src/components/AuthPage.tsx)
* **Core Technologies**: React, Tailwind CSS, Lucide icons, Framer Motion transitions.

---

## 2. API Communication Pipelines

The frontend dispatches secure HTTP fetch operations pointing to the backend API Worker (`http://localhost:8787` in local environment).

```mermaid
sequenceDiagram
    participant User as Frontend UI (AuthPage)
    participant API as Backend Worker (api/src/index.ts)
    participant DB as Supabase DB

    User->>User: Client-side Form Validation
    Note over User: If valid, triggers visual loading step sequence
    User->>API: HTTP POST /auth/register (Credentials JSON)
    alt API server is online & DB resolves
        API->>DB: POST /auth/v1/signup
        DB-->>API: Response UUID Profile
        API-->>User: HTTP 200 { success: true, user }
        User->>User: Transition to Workspace Success Screen
    alt API server offline / DB DNS error
        API-->>User: HTTP 200 { success: true, message: 'Fallback local database', user }
        Note over User: UI gracefully fallback, alerting developer console
        User->>User: Transition to Workspace Success Screen
    end
```

---

## 3. Request / Response Contracts

### A. Register Account ("Join Beta")
Dispatched when submitting credentials on the "Join Beta" form.

* **Endpoint**: `POST http://localhost:8787/auth/register`
* **Request Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
* **Payload Structure**:
  ```json
  {
    "name": "Adnan Shahria",
    "email": "adnan@university.edu",
    "institution": "Stanford University",
    "major": "Quantum Computing",
    "role": "PhD Candidate",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Registered successfully in Supabase DB!",
    "user": {
      "id": "7b04bfce-d98c-4a3e-bfa1-d419bc8f0612",
      "email": "adnan@university.edu",
      "name": "Adnan Shahria",
      "institution": "Stanford University",
      "major": "Quantum Computing",
      "role": "PhD Candidate"
    }
  }
  ```
* **Error Response (400 Bad Request / 500 Server Error)**:
  ```json
  {
    "error": "User already exists"
  }
  ```

---

### B. Authorize Account ("Login")
Dispatched when entering credentials on the "Login" form.

* **Endpoint**: `POST http://localhost:8787/auth/login`
* **Request Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
* **Payload Structure**:
  ```json
  {
    "email": "adnan@university.edu",
    "password": "securepassword123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Authorized in Supabase DB!",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "7b04bfce-d98c-4a3e-bfa1-d419bc8f0612",
      "email": "adnan@university.edu",
      "name": "Adnan Shahria",
      "institution": "Stanford University",
      "major": "Quantum Computing",
      "role": "PhD Candidate"
    }
  }
  ```
* **Error Response (401 Unauthorized)**:
  ```json
  {
    "error": "Invalid email or password"
  }
  ```

---

## 4. Frontend Client Validation

Before a fetch call is dispatched, the client runs strict layout validations:
* **Full Name**: Non-empty requirement check.
* **Academic Email**: Regex formatting validation (`/\S+@\S+\.\S+/`).
* **Institution & Major**: Non-empty requirement checks.
* **Password**: Minimum length constraint of 6 characters.
* **Terms Checkbox**: Must be checked (`true`) to allow beta access registration.

---

## 5. Fail-Safe Offline Robustness
If a connection to the Cloudflare Worker API fails (e.g., worker server not running, or throwing network connection exceptions):
1. **Console Warning**: A descriptive warning is printed: `API worker offline. Graceful fallback activated.`
2. **Simulation Mode**: The client automatically provisions a local mock profile containing their inputs.
3. **Workspace Access**: The congratulations screen resolves flawlessly, ensuring a 100% stable presentation and testing lifecycle.
