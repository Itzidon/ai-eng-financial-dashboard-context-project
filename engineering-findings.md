# Phase 2 - Engineering findings

## Hallazgos verificados

### 1. Prioridad alta - El flujo frontend a backend mediante el proxy no fue operativo durante la verificación

❓ Causa no determinada. El proxy de Vite dirige las rutas `/api` a `http://backend:8000` y el dashboard solicita `/api/metrics`. Durante la verificación, las solicitudes a `http://localhost:5173/api/metrics` y `http://localhost:5173/api/metrics/facets` agotaron el timeout de 10 segundos. También agotaron el timeout las solicitudes desde el contenedor `frontend` a `backend:8000` y a la IP interna del contenedor backend. En cambio, el backend respondió desde el host y desde su propio contenedor.

Evidencia de configuración: `frontend/vite.config.ts`, `frontend/src/App.tsx`, `docker-compose.yml`.

Riesgo: la pantalla principal no puede cargar sus datos cuando el acceso depende del proxy, aunque los servicios se inicien y la API responda directamente.

### 2. Prioridad media - No hay prueba de integración para el flujo del proxy

✅ Las pruebas de frontend cubren funciones puras de cálculo y formato. Las pruebas de backend usan `TestClient` contra la aplicación FastAPI. Ninguna prueba arranca los servicios de Docker Compose ni comprueba una petición a través de Vite hacia `/api`.

Evidencia: `frontend/src/lib/financial-utils.test.ts`, `backend/tests/test_routes.py`, `frontend/vite.config.ts`, `docker-compose.yml`.

Riesgo: una regresión en la ruta navegador -> Vite -> backend puede pasar las suites disponibles.

### 3. Prioridad media - Los datos simulados dependen de la fecha actual, mientras la UI muestra un período fijo

✅ El backend deriva el año de cada mes con `date.today()`, incluso cuando genera movimientos con la semilla `42`. El componente principal entrega a su encabezado el texto fijo `2024 - Full Year`.

Evidencia: `backend/app/routes.py`, `frontend/src/App.tsx`, `frontend/src/components/dashboard/dashboard-header.tsx`.

Riesgo: con el paso del calendario, los datos y el período visible pueden no coincidir; las expectativas basadas en fechas concretas también pueden perder vigencia.

### 4. Prioridad media - La generación de datos modifica el estado global de aleatoriedad

✅ `generate_mock_movements` invoca `random.seed(seed)` sobre el módulo global `random`.

Evidencia: `backend/app/routes.py`.

Riesgo: código futuro que use aleatoriedad en el mismo proceso puede depender del orden de ejecución de pruebas o solicitudes.

### 5. Prioridad baja - El contrato financiero se mantiene por duplicado

✅ El frontend define `FinancialMovement` y sus literales en TypeScript, mientras el backend define el modelo Pydantic y literales equivalentes en Python.

Evidencia: `frontend/src/lib/financial-types.ts`, `backend/app/routes.py`.

Riesgo: cambios de campos, valores permitidos o significado de datos pueden desincronizar API y UI sin una prueba de contrato compartida.

### 6. Prioridad baja - CORS permite todos los orígenes y credenciales

✅ La aplicación FastAPI configura `allow_origins=["*"]` y `allow_credentials=True`.

Evidencia: `backend/app/main.py`.

Riesgo: una configuración orientada al desarrollo puede trasladarse a un despliegue con requisitos más restrictivos sin ser revisada.

### 7. Prioridad baja - La compilación avisa sobre el tamaño del bundle

✅ La compilación frontend terminó correctamente, pero Vite informó un bundle JavaScript minificado de 584.26 kB, por encima de su umbral de aviso de 500 kB. Los dos componentes de gráfica importan Recharts directamente.

Evidencia: `frontend/package.json`, `frontend/src/components/dashboard/income-outcome-chart.tsx`, `frontend/src/components/dashboard/profit-percent-chart.tsx`.

Riesgo: el coste de carga inicial puede aumentar al ampliar el dashboard.

## Convenciones observadas

✅ El frontend usa TypeScript y React con el alias de imports `@`. Los componentes específicos del producto viven en `frontend/src/components/dashboard`, las primitivas reutilizables en `frontend/src/components/ui`, y tipos/cálculos en `frontend/src/lib`.

Evidencia: `frontend/vite.config.ts`, `frontend/components.json`, `frontend/src/components/dashboard`, `frontend/src/components/ui`, `frontend/src/lib`.

✅ El frontend usa Tailwind CSS y variables CSS. Los componentes exportan funciones con nombres en PascalCase y declaran props tipadas.

Evidencia: `frontend/src/index.css`, `frontend/src/components/dashboard/kpi-card.tsx`, `frontend/eslint.config.js`.

✅ El backend concentra modelos Pydantic, handlers `@router.get`, filtros y agregaciones en `backend/app/routes.py`; `backend/app/main.py` crea la aplicación e incorpora ese router.

Evidencia: `backend/app/routes.py`, `backend/app/main.py`.

✅ Docker Compose es la forma documentada de iniciar ambos servicios. Los comandos de pruebas se ejecutaron correctamente dentro de sus respectivos contenedores, que contienen sus dependencias.

Evidencia: `README.es.md`, `docker-compose.yml`, `frontend/Dockerfile`, `backend/Dockerfile`, `frontend/package.json`, `backend/requirements.txt`.

## Validaciones ejecutadas

✅ `docker compose up --build` construyó e inició los servicios `frontend` y `backend`.

Evidencia: `README.es.md`, `docker-compose.yml`.

✅ `docker compose exec -T frontend npm test`: 1 archivo de pruebas y 5 pruebas correctas.

Evidencia: `frontend/package.json`, `frontend/src/lib/financial-utils.test.ts`.

✅ `docker compose exec -T backend pytest`: 15 pruebas correctas. La ejecución mostró dos avisos de deprecación relacionados con Starlette y HTTPX.

Evidencia: `backend/requirements.txt`, `backend/tests/test_routes.py`.

✅ `docker compose exec -T frontend npm run lint`: correcto.

Evidencia: `frontend/package.json`, `frontend/eslint.config.js`.

✅ `docker compose exec -T frontend npm run build`: correcto, con el aviso de tamaño de bundle documentado arriba.

Evidencia: `frontend/package.json`.

❌ Ejecutar `npm test` desde la raíz falló porque la raíz no contiene `package.json`. Ejecutar `pytest` desde la raíz falló al no disponer de FastAPI en el entorno Python del host. No son fallos reproducidos de las suites en sus contenedores configurados.

Evidencia: `frontend/package.json`, `frontend/Dockerfile`, `backend/requirements.txt`, `backend/Dockerfile`.

## Reglas propuestas para futuros coding agents

### Verificar proxy mediante HTTP

- Categoría: Integración.
- Regla accionable: tras cambiar llamadas `/api`, `frontend/vite.config.ts` o `docker-compose.yml`, comprobar la ruta a través de `http://localhost:5173/api/...` además de consultar el backend directamente.
- Por qué existe: el proxy configurado no respondió durante la verificación, mientras la API directa sí respondió.
- Evidencia: `frontend/vite.config.ts`, `frontend/src/App.tsx`, `verification.md`.
- Riesgo evitado: dar por funcional la ruta real de carga de datos por la sola presencia de configuración.

### No atribuir timeouts sin evidencia

- Categoría: Diagnóstico.
- Regla accionable: registrar un timeout frontend-backend como observación y reunir evidencia antes de modificar DNS, Docker, red o código.
- Por qué existe: se verificó el timeout, pero no su causa.
- Evidencia: `verification.md`, `docker-compose.yml`, `frontend/vite.config.ts`.
- Riesgo evitado: cambios especulativos de infraestructura.

### Validar en el contexto del servicio

- Categoría: Validación.
- Regla accionable: usar `docker compose exec -T frontend npm test`, `docker compose exec -T frontend npm run lint`, `docker compose exec -T frontend npm run build` y `docker compose exec -T backend pytest` al validar cambios respectivos.
- Por qué existe: las dependencias y scripts pertenecen a los servicios, no a la raíz del workspace.
- Evidencia: `frontend/package.json`, `frontend/Dockerfile`, `backend/requirements.txt`, `backend/Dockerfile`.
- Riesgo evitado: interpretar la falta de dependencias o un directorio de trabajo incorrecto como un defecto de la aplicación.

### Sincronizar el contrato FinancialMovement

- Categoría: Contrato API.
- Regla accionable: al cambiar campos, literales o semántica de movimientos en `backend/app/routes.py`, actualizar `frontend/src/lib/financial-types.ts` y ajustar pruebas pertinentes.
- Por qué existe: el contrato existe por separado en Python y TypeScript.
- Evidencia: `backend/app/routes.py`, `frontend/src/lib/financial-types.ts`.
- Riesgo evitado: discrepancias entre la API y la UI.

### Controlar el período de datos simulados

- Categoría: Datos de desarrollo.
- Regla accionable: al modificar la generación de datos, conservar una fuente de fecha controlable o mantener sincronizado el período mostrado en la interfaz.
- Por qué existe: las fechas generadas dependen del calendario y el encabezado muestra un período fijo.
- Evidencia: `backend/app/routes.py`, `frontend/src/App.tsx`, `frontend/src/components/dashboard/dashboard-header.tsx`.
- Riesgo evitado: resultados y etiquetas temporales inconsistentes.

### Evitar acoplarse a random global

- Categoría: Backend.
- Regla accionable: no añadir lógica que dependa del estado global de `random` alrededor de `generate_mock_movements`; al ampliar la generación, preferir un generador local.
- Por qué existe: la generación actual modifica el estado global con `random.seed(seed)`.
- Evidencia: `backend/app/routes.py`.
- Riesgo evitado: pruebas y resultados dependientes del orden de ejecución.

### Añadir integración al cambiar la carga de datos

- Categoría: Pruebas.
- Regla accionable: cambios que afecten la carga frontend, el proxy o una ruta consumida por la interfaz deben incluir una verificación de integración además de pruebas unitarias.
- Por qué existe: las suites existentes no cubren la comunicación configurada por el proxy.
- Evidencia: `frontend/src/lib/financial-utils.test.ts`, `backend/tests/test_routes.py`, `frontend/vite.config.ts`.
- Riesgo evitado: regresiones del flujo de carga principal que las suites unitarias no detectan.

### Mantener la organización frontend

- Categoría: Arquitectura frontend.
- Regla accionable: colocar componentes de dashboard en `frontend/src/components/dashboard`, primitivas reutilizables en `frontend/src/components/ui`, y tipos o cálculos puros en `frontend/src/lib`; usar el alias `@` para imports internos.
- Por qué existe: esa es la estructura y configuración de alias existente.
- Evidencia: `frontend/components.json`, `frontend/vite.config.ts`, `frontend/src/components/dashboard`, `frontend/src/components/ui`, `frontend/src/lib`.
- Riesgo evitado: responsabilidades dispersas e imports inconsistentes.