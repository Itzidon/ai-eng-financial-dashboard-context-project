# Datos y contrato API

## Sincronizar el contrato FinancialMovement

- Alcance: cambios de campos, literales o semántica de movimientos financieros.
- Instrucción accionable: al cambiar `backend/app/routes.py`, actualizar `frontend/src/lib/financial-types.ts` y ajustar pruebas pertinentes.
- Justificación: el contrato existe por separado en Python y TypeScript.
- Evidencia concreta: `backend/app/routes.py`, `frontend/src/lib/financial-types.ts`.

## Controlar el período de datos simulados

- Alcance: cambios en la generación de datos de desarrollo o en el período mostrado por la interfaz.
- Instrucción accionable: conservar una fuente de fecha controlable o mantener sincronizado el período mostrado en la interfaz.
- Justificación: las fechas generadas dependen del calendario y el encabezado muestra un período fijo.
- Evidencia concreta: `backend/app/routes.py`, `frontend/src/App.tsx`, `frontend/src/components/dashboard/dashboard-header.tsx`.

## Evitar acoplarse a random global

- Alcance: ampliaciones de la generación de movimientos simulados.
- Instrucción accionable: no añadir lógica que dependa del estado global de `random` alrededor de `generate_mock_movements`; preferir un generador local al ampliar esa generación.
- Justificación: la generación actual modifica el estado global con `random.seed(seed)`.
- Evidencia concreta: `backend/app/routes.py`.