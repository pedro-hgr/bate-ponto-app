# Bate Ponto Backend

Spring Boot backend for the Bate Ponto frontend.

## Endpoints

- `POST /api/users/register` — create user
- `POST /api/users/login` — login with email and password
- `GET /api/users` — list users
- `GET /api/users/{id}` — retrieve user
- `PUT /api/users/{id}` — update user

- `GET /api/registro-pontos` — list time records; optional `usuarioId`
- `GET /api/registro-pontos/{id}` — retrieve record
- `POST /api/registro-pontos` — create time record
- `PUT /api/registro-pontos/{id}` — update time record

- `GET /api/eventos` — list events; optional `usuarioId`
- `GET /api/eventos/{id}` — retrieve event
- `POST /api/eventos` — create event with optional file attachment
- `PUT /api/eventos/{id}` — update event with optional attachment
- `GET /api/eventos/attachments/{filename}` — download attachment

## Run

1. Install Maven if not already installed, or use the local Maven binary included in this folder.
2. From the `backend` folder run one of these commands:

```bash
# If mvn is installed globally
mvn spring-boot:run

# If Maven is not installed globally, use the local binary
./apache-maven-3.9.9/bin/mvn.cmd spring-boot:run
```

3. Access the H2 console at `http://localhost:8080/h2-console`.

## Notes

- The backend uses an in-memory H2 database by default.
- Attachments are saved to `uploads/` and served from `/api/eventos/attachments/{filename}`.
- CORS is enabled for all origins on `/api/**`.
