# Postman API Collection — Phase 3B Auth & RBAC

This directory contains the official **Postman API Test Collection (`CareNova_API_Collection.json`)** for testing Authentication and Role-Based Access Control (RBAC) in Phase 3B of the CareNova Health Management System.

---

## How to Import & Run in Postman

1. Open **Postman**.
2. Click **Import** and select `Major-Project/postman/CareNova_API_Collection.json`.
3. Ensure the collection variable `baseUrl` is set to `http://localhost:5000`.
4. Ensure your Express server is running (`npm start` inside `server/`).

---

## Recommended Test Execution Order

### 1. Test Unauthenticated Access (401 Unauthorized)
- Run `GET /api/auth/me` without logging in → **HTTP 401 Unauthorized**.
- Run `GET /api/test/patient` without logging in → **HTTP 401 Unauthorized**.

### 2. Test Patient Role Authentication & RBAC
- Run `POST /api/auth/login` with `sangeetha.patient@example.com` / `demo123`.
- Cookie `carenova_token` is automatically captured by Postman.
- Run `GET /api/auth/me` → **HTTP 200 OK** (Patient details).
- Run `GET /api/test/patient` → **HTTP 200 OK** (Access Granted).
- Run `GET /api/test/doctor` → **HTTP 403 Forbidden** (Role mismatch).
- Run `GET /api/test/admin` → **HTTP 403 Forbidden** (Role mismatch).
- Run `POST /api/auth/logout` → **HTTP 200 OK** (Cookie cleared).

### 3. Test Doctor Role Authentication & RBAC
- Run `POST /api/auth/login` with `sarah.jenkins@carenova.health` / `demo123`.
- Run `GET /api/test/doctor` → **HTTP 200 OK** (Access Granted).
- Run `GET /api/test/patient` → **HTTP 403 Forbidden**.
- Run `GET /api/test/admin` → **HTTP 403 Forbidden**.
- Run `POST /api/auth/logout`.

### 4. Test Admin Role Authentication & RBAC
- Run `POST /api/auth/login` with `admin@carenova.health` / `demo123`.
- Run `GET /api/test/admin` → **HTTP 200 OK** (Access Granted).
- Run `POST /api/auth/logout`.

### 5. Test Patient Registration
- Run `POST /api/auth/register` with new email (e.g. `test.patient@example.com`).
- Verify HTTP 201 Created and role defaulted to `patient`.
- Run Duplicate Registration with same email → **HTTP 409 Conflict**.
