# Backend Overview – Social-Media-Manager

---

## 🏗 Why a **Feature-based** Architecture?

| Reason        | Pay-off in this project                                                      |
|---------------|------------------------------------------------------------------------------|
| **Rapidity**  | Teams build or modify a feature (auth, users…) in isolation → faster cycles. |
| **Readability** | Controller + Service + Repository + DTOs + Tests live side-by-side.          |
| **Lightweight** | No heavy, multi-layered boilerplate. NestJS modules stay lean & fast.       |

---

## ⚙️ Core Technologies

| Layer            | Choice & Why                                                             |
|------------------|--------------------------------------------------------------------------|
| Framework        | **NestJS 11** – declarative DI, guards, pipes, testing utilities.        |
| ORM              | **TypeORM** – Active Record + custom repositories, migrations ready.     |
| Database         | **PostgreSQL 14** – reliable relational engine, great for JSONB if needed.|
| Auth             | **JWT + Passport Strategy** with custom guard & blacklist.               |
| Geo Search       | **OpenStreetMap Overpass API** – free, no API key required.              |
| Containerization | **Docker Compose** – one-liner spins DB + API in dev mode (watch).       |

---

## ✨ Feature Highlights

| Feature            | Endpoint(s)                | Notes                                                                          |
|--------------------|----------------------------|--------------------------------------------------------------------------------|
| **Auth**           | `/auth/register`, `/login` | JWT issued on login; tokens wrapped in `createApiResponse`.                    |
| **Logout**         | `/auth/logout`             | **Blacklist service** stores token `jti` with TTL → revoked tokens are blocked.|
| **Refresh Token**  | `/auth/refresh-token`      | New access/refresh pair, old refresh checked & rotated.                        |
| **Users**          | internal                   | Passwords salted & hashed with bcrypt; password stripped from all outputs.     |
| **Transactions**   | `/transactions` CRUD       | Repo pattern, pagination (`page`, `size`), meta in response.                   |
| **Nearby Restaurants** | `/restaurants/nearby`      | Query by **city** _or_ **lat/lon**; pagination handled in-service.             |

---

## 🔒 Black-list Flow (Logout)

1. `POST /auth/logout` receives `Bearer <token>`.
2. `AuthService.logout()` decodes token → extracts `jti` & `exp`.
3. Stores `jti` with TTL = `exp-now` seconds in **BlacklistService**.
4. `JwtAuthGuard` checks every request: if `jti` in blacklist → `Unauthorized`.

Result: logged-out tokens are immediately invalid even before they naturally expire.

