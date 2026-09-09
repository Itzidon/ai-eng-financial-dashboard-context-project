# Tech stack

## Frontend

- React 19, React DOM 19, TypeScript, Vite 8, Tailwind CSS 4.
- Recharts (charts), Lucide React (icons), class-variance-authority, clsx, tailwind-merge.
- ESLint (flat config) + typescript-eslint for linting; Vitest for testing.

Evidence: [frontend/package.json](../frontend/package.json),
[frontend/eslint.config.js](../frontend/eslint.config.js),
[frontend/vite.config.ts](../frontend/vite.config.ts).

## Frontend structure conventions

- Import alias `@` resolves to `frontend/src`.
- Product-specific components live in `frontend/src/components/dashboard`.
- Reusable UI primitives live in `frontend/src/components/ui`.
- Pure types and calculations live in `frontend/src/lib`.

Evidence: [frontend/vite.config.ts](../frontend/vite.config.ts),
[frontend/components.json](../frontend/components.json),
[.agents/rules/frontend-architecture.md](../.agents/rules/frontend-architecture.md).

## Backend

- Python 3.13, FastAPI, Uvicorn (with `--reload` in the container), `debugpy` for remote
  debugging, Pytest + pytest-cov for testing, HTTPX as FastAPI's test HTTP client
  dependency.

Evidence: [backend/Dockerfile](../backend/Dockerfile),
[backend/requirements.txt](../backend/requirements.txt).

## Backend structure conventions

- Pydantic models, `@router.get` handlers, and filtering/aggregation logic are all
  concentrated in a single module, `backend/app/routes.py`.
- `backend/app/main.py` creates the `FastAPI` app, configures CORS, and includes that
  router.

Evidence: [backend/app/routes.py](../backend/app/routes.py),
[backend/app/main.py](../backend/app/main.py).

## Infrastructure

- Docker Compose orchestrates two services: `frontend` (port `5173`) and `backend`
  (ports `8000` and `5678` for the debugger).
- Vite's dev server proxies `/api` to `http://backend:8000` inside the Compose network.

Evidence: [docker-compose.yml](../docker-compose.yml),
[frontend/vite.config.ts](../frontend/vite.config.ts).

## How to run and validate

- Start everything: `docker compose up --build` (documented command).
- Frontend checks run inside its container: `docker compose exec -T frontend npm test`,
  `npm run lint`, `npm run build`, and the proxy diagnostic
  `npm run check:proxy`.
- Backend checks run inside its container: `docker compose exec -T backend pytest`.
- Running `npm test` or `pytest` from the repository root fails, because the root has
  no `package.json` and the host Python environment has no FastAPI installed; these
  commands must run in the service containers.

Evidence: [docker-compose.yml](../docker-compose.yml),
[frontend/package.json](../frontend/package.json),
[backend/requirements.txt](../backend/requirements.txt),
[.agents/rules/integration-validation.md](../.agents/rules/integration-validation.md),
[verification.md](../verification.md).
