# Phase 1 — Handover verification

## Resumen del producto

✅ El proyecto es un panel de métricas financieras. El frontend obtiene movimientos financieros, calcula indicadores y datos mensuales, y renderiza gráficos.

Evidencia: `README.es.md`, `frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts`.

## Estructura principal

```text
.
├── frontend/          Aplicación web
├── backend/           API HTTP
├── docker-compose.yml Orquestación local
├── README.md
└── README.es.md
```

✅ La estructura anterior fue comprobada en la raíz del repositorio.

## Frontend y backend

✅ El frontend usa React y TypeScript, servido en desarrollo por Vite.

Evidencia: `frontend/package.json`, `frontend/src/main.tsx`.

✅ El backend es una API Python creada con FastAPI y servida por Uvicorn. El contenedor inicia `debugpy`.

Evidencia: `backend/requirements.txt`, `backend/Dockerfile`, `backend/app/main.py`.

## Stack tecnológico

✅ Frontend: React 19, React DOM, TypeScript, Vite 8, Tailwind CSS 4, Recharts, Lucide React, ESLint y Vitest.

Evidencia: `frontend/package.json`.

✅ Backend: Python 3.13, FastAPI, Uvicorn, Debugpy, Pytest, pytest-cov y HTTPX.

Evidencia: `backend/Dockerfile`, `backend/requirements.txt`.

✅ Infraestructura: Docker Compose.

Evidencia: `docker-compose.yml`.

## Forma de ejecución

✅ El comando documentado para arrancar el proyecto desde la raíz es:

```bash
docker compose up --build
```

El comando fue ejecutado correctamente y construyó los servicios `frontend` y `backend`.

Evidencia: `README.es.md`, `docker-compose.yml`.

## Servicios, puertos y entry points

✅ El servicio `frontend` depende de `backend`, publica el puerto `5173` y ejecuta Vite con `--host 0.0.0.0 --port 5173`.

Evidencia: `docker-compose.yml`, `frontend/Dockerfile`.

✅ El servicio `backend` publica los puertos `8000` y `5678`, y ejecuta Uvicorn con el entry point `app.main:app` en `0.0.0.0:8000`.

Evidencia: `docker-compose.yml`, `backend/Dockerfile`.

✅ Entry points de la aplicación:

- Frontend HTML: `frontend/index.html`, que carga `frontend/src/main.tsx`.
- Frontend React: `frontend/src/main.tsx`, que renderiza `App`.
- Frontend principal: `frontend/src/App.tsx`.
- Backend FastAPI: `backend/app/main.py`.
- Router y lógica HTTP: `backend/app/routes.py`.

## URLs y endpoints comprobados

✅ `http://localhost:5173/` respondió `HTTP 200`.

Evidencia de configuración: `docker-compose.yml`, `frontend/Dockerfile`.

✅ `http://localhost:8000/health` respondió `HTTP 200` con `{"status":"ok"}`.

Evidencia: `backend/app/routes.py`, `backend/tests/test_routes.py`.

✅ `http://localhost:8000/api/metrics` respondió `HTTP 200` con movimientos financieros.

Evidencia: `backend/app/routes.py`, `frontend/src/App.tsx`.

✅ `http://localhost:8000/docs` respondió `HTTP 200`.

Evidencia: `README.es.md`, `backend/app/main.py`.

✅ Las rutas adicionales declaradas son `GET /api/metrics/facets`, `/summary`, `/categories/top`, `/comparison`, `/alerts`, `/b2b` y `/b2c`.

Evidencia: `backend/app/routes.py`.

## Comunicación entre servicios

❌ Se corrigió una afirmación inicial: no puede confirmarse que el proxy frontend-backend funcione solo porque está configurado.

El proxy de Vite configura `/api` hacia `http://backend:8000`, y el frontend solicita `/api/metrics`.

Evidencia: `frontend/vite.config.ts`, `frontend/src/App.tsx`.

❓ Causa no determinada: durante la comprobación, `http://localhost:5173/api/metrics` y `/api/metrics/facets` agotaron un timeout de 10 segundos. Desde el contenedor `frontend`, las peticiones a `backend:8000` y a la IP interna del backend también agotaron el timeout. El backend sí respondió desde el host y dentro de su propio contenedor. No hay evidencia suficiente en los archivos del repositorio o en las comprobaciones realizadas para atribuir la causa.

## Estado de cambios

✅ Esta verificación no modificó código ni configuración de la aplicación. Solo se añadió este documento y no se realizó ningún commit.