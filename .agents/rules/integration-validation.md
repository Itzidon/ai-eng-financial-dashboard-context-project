# Integración y validación

## Verificar proxy mediante HTTP

- Alcance: cambios en llamadas `/api`, `frontend/vite.config.ts` o `docker-compose.yml`.
- Instrucción accionable: comprobar una ruta a través de `http://localhost:5173/api/...` además de consultar el backend directamente.
- Justificación: el proxy configurado no respondió durante la verificación, mientras la API directa sí respondió.
- Evidencia concreta: `frontend/vite.config.ts`, `frontend/src/App.tsx`, `verification.md`.

## No atribuir timeouts sin evidencia

- Alcance: diagnósticos de timeouts entre frontend y backend.
- Instrucción accionable: registrar el timeout como observación y reunir evidencia antes de modificar DNS, Docker, red o código.
- Justificación: se verificó el timeout, pero no su causa.
- Evidencia concreta: `verification.md`, `docker-compose.yml`, `frontend/vite.config.ts`.

## Validar en el contexto del servicio

- Alcance: validaciones de frontend y backend.
- Instrucción accionable: usar `docker compose exec -T frontend npm test`, `docker compose exec -T frontend npm run lint`, `docker compose exec -T frontend npm run build` y `docker compose exec -T backend pytest` según el servicio afectado.
- Justificación: las dependencias y scripts pertenecen a los servicios, no a la raíz del workspace.
- Evidencia concreta: `frontend/package.json`, `frontend/Dockerfile`, `backend/requirements.txt`, `backend/Dockerfile`.

## Añadir integración al cambiar la carga de datos

- Alcance: cambios que afecten carga frontend, proxy o rutas consumidas por la interfaz.
- Instrucción accionable: incluir una verificación de integración además de las pruebas unitarias.
- Justificación: las suites existentes no cubren la comunicación configurada por el proxy.
- Evidencia concreta: `frontend/src/lib/financial-utils.test.ts`, `backend/tests/test_routes.py`, `frontend/vite.config.ts`.