# Gesta project guidelines

## Build, test, and lint

- Use Node.js `>=22.14.0` (Node 24 LTS is recommended). Install the locked dependencies with `npm ci`.
- First-time local setup: `npm run setup`. This creates `backend/.env` and initializes `backend/data/gesta.db` with demo data.
- Run both applications with `npm run dev`: the API listens on `http://localhost:3000` and Vite serves the frontend on `http://localhost:5173`.
- Run the repository checks from the root:
  - `npm run lint` — Oxlint for both workspaces; warnings fail.
  - `npm run typecheck` — TypeScript checks for both workspaces.
  - `npm test` — all Vitest suites.
  - `npm run build` — backend compilation plus frontend typecheck/Vite build.
  - `npm run check` — lint, typecheck, tests, and build.
- Run one backend test file with `npm run test -w backend -- tests/auth.test.ts`, or one frontend test file with `npm run test -w frontend -- tests/LoginPage.test.tsx`.
- Narrow a test further with Vitest’s name filter, for example `npm run test -w backend -- tests/auth.test.ts -t "demo login"`.
- Use `npm run db:init` to apply migrations and seed an empty database. Use `npm run db:reset` to recreate demo data, but stop `npm run dev` first on Windows.

See [README.md](../README.md) for setup/troubleshooting and [docs/architecture.md](../docs/architecture.md) for the maintained architecture overview.

## Architecture

This is an npm-workspaces monorepo with a React/Vite frontend and an Express/SQLite backend. The frontend calls `/api/...`; Vite proxies that path to the backend and removes `/api`.

Backend request flow:

```text
HTTP request
  -> app.ts middleware and router
  -> controller (HTTP validation/response)
  -> service (business rules)
  -> repository (SQL)
  -> SQLite
```

- `backend/src/app.ts` composes repositories, services, authentication, routers, and error handling.
- Controllers validate query/body input and translate failures into `HttpError`.
- Services must remain independent of Express `Request`/`Response`; authorization and visibility rules belong in services and named predicates in `services/permissions.ts`.
- Repositories contain handwritten SQL and return database-row objects. Mappers convert database rows to domain objects and API DTOs.
- `authenticate` resolves the token and reloads the current account, roles, and companies from the database. `authorize(...)` enforces access at the route boundary.
- `backend/src/db/migrations/` contains ordered, one-time SQL migrations. Add a new numbered migration for schema changes; do not edit an applied migration.
- The centralized error middleware returns `{ "error": { "code", "message" } }`.

Frontend request flow:

```text
pages -> hooks -> services/utils -> models
   \-> reusable components
```

- `App.tsx` is the single owner of `useAuth`; it supplies the session, token, and logout callback to pages.
- Services perform HTTP calls and validate JSON with type guards. Hooks expose display-ready state and handle loading, errors, cancellation, and 401 logout behavior.
- Pages compose hooks and components; reusable components should not know about routing.

## Repository conventions

- Backend relative imports intentionally use `.ts` extensions; TypeScript rewrites them to `.js` in the build output.
- The `Authorization` header contains the session token directly, without a `Bearer` prefix.
- Configure the API with `API_PORT` (not `PORT`); the frontend proxy defaults to port 3000. The frontend uses port 5173 with `strictPort`.
- Demo authentication is for local development only. `DEMO_AUTH_ENABLED=true` is rejected when `NODE_ENV=production`; never treat demo login as real authentication.
- Keep authorization in the backend even when the frontend hides a route or menu item. Backend rules are based on the current database identity, not claims supplied by the frontend.
- Throw `new HttpError(status, code, message)` for expected API errors so the error middleware preserves the documented response shape. Do not return ad-hoc error JSON from controllers.
- Keep status codes in the database/API (for example `PUBLISHED`, `ACTIVE`) and use frontend label utilities for French display text.
- Backend tests use Vitest and Supertest with an in-memory SQLite database created by `backend/tests/helpers/testApp.ts`; they must not use the development database. Seed IDs in `backend/src/db/seed/seedIds.ts` provide stable fixtures.
- Frontend tests use Vitest, Testing Library, and the fetch mock helpers under `frontend/tests/helpers/`.
- When adding or changing an API route, update [backend/API.md](../backend/API.md) and the corresponding REST Client request under [backend/http/](../backend/http/). When changing schema, add a migration and update relevant database tests.
- Use the existing dependency-injection factories (`create...Repository`, `create...Service`, router factories) so tests can assemble a complete app with an isolated database.
- Before committing a substantial change, run `npm run check` and update the project documentation when behavior or API contracts change. Follow the repository pull request checklist in [pull_request_template.md](pull_request_template.md).
