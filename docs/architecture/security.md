# Security Model

## Authentication — JWT

- Users authenticate via `POST /api/auth/login` and receive an HS256-signed JWT.
- The token is stored in the browser's `localStorage` and sent as `Authorization: Bearer <token>`.
- A `JwtAuthenticationFilter` validates the token on every request and populates the Spring `SecurityContext`.
- Sessions are stateless; CSRF is disabled (no cookies are used).
- Token lifetime defaults to 24 hours (`jwt.expiration` ms).
- `GET /api/auth/me` lets the client discover the signed-in user and role.

## Authorization — Role-Based Access Control (RBAC)

Five roles, in increasing privilege:

```
OPERATOR < ENGINEER < MAINTENANCE_ENGINEER < MANAGER < ADMIN
```

The `Role` is mapped to the Spring authority `ROLE_<NAME>` and to the `access_level` field passed to the AI engine.

### Enforcement points

| Layer | Enforcement |
|-------|-------------|
| Frontend | Route guard requires a token in `localStorage` |
| Backend | Any request to `/api/**` except `/api/auth/**` and `/actuator/health` requires a valid JWT |
| AI Service | Retrieval SQL filters chunks by `access_level` of both the document and the caller (see below) |

### RBAC-before-retrieval

Authorization happens **inside** the vector query, not after it — documents are only candidates if:

```text
UPPER(documents.access_level) = 'PUBLIC'
   OR UPPER(documents.access_level) = UPPER(caller_role)
```

This guarantees an authorized user receives top-K results and an unauthorized user never receives restricted content (ADR-005).

## Role assignment

- **Self-registration is restricted to `OPERATOR`** regardless of any role supplied in the request body (`AuthService`). Higher roles are provisioned only by the startup seed or direct database writes.
- On an empty `users` table, the backend seeds `admin`, `engineer`, `manager`, `operator` (all `password123`). Disable with `SEED_DEFAULT_USERS=false` for production.

## Known limitations & recommendations

| Area | Limitation | Recommendation |
|------|-----------|----------------|
| Token storage | `localStorage` is XSS-accessible | Move to `HttpOnly`+`Secure` cookies or a BFF proxy for hardened deployments |
| Seed passwords | Default credentials are publicly known | Change or disable seed users outside development |
| JWT secret | A dev default is baked into `application.yml` | Always set `JWT_SECRET` to a long random value |
| Data in transit | Plain HTTP in local dev | Terminate behind TLS in production |
| Rate limiting | None on `/api/auth/login` | Add login throttling / lockout in production |
| Audit logging | Not implemented | Log auth and document delete events for compliance |

## Threat model summary

- **Unauthorized API access** — prevented by JWT validation on every protected route.
- **Privilege escalation** — prevented by forcing `OPERATOR` on self-registration.
- **Data leakage via retrieval** — prevented by RBAC filter inside the ANN query; LLM prompt only ever contains retrieved (authorized) chunks.
- **Prompt injection** — mitigated by instructing the model to answer only from the provided context; document text is untrusted input, so a stricter classifier may be warranted for hostile knowledge bases.