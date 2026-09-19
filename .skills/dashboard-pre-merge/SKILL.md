# Dashboard Pre-Merge Validation

## Objetivo

Validar este dashboard financiero antes de hacer merge para evitar cambios que rompan el frontend o su conexión con el backend.

## Inputs

- Cambios actuales de la rama.
- `frontend/`
- `frontend/vite.config.ts`
- `docker-compose.yml`

## Pasos

1. Ejecutar los tests del frontend:
   `docker compose exec -T frontend npm test`

2. Ejecutar lint:
   `docker compose exec -T frontend npm run lint`

3. Ejecutar el build:
   `docker compose exec -T frontend npm run build`

4. Verificar que el proxy `/api` de Vite sigue apuntando al servicio Docker `http://backend:8000`.

5. Ejecutar:
   `git status --short`

6. Informar de cualquier error antes de permitir el merge.

## Output esperado

Un resumen indicando:
- tests: PASS/FAIL
- lint: PASS/FAIL
- build: PASS/FAIL
- proxy backend: PASS/FAIL
- archivos pendientes según git status

## Criterios de aceptación

- Tests finalizan sin errores.
- Lint finaliza sin errores.
- Build finaliza correctamente.
- El proxy `/api` apunta a `http://backend:8000`.
- No se ocultan errores ni advertencias nuevas relevantes.
