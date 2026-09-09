# Arquitectura frontend

## Mantener la organización frontend

- Alcance: nuevos componentes, primitivas de interfaz, tipos o cálculos frontend.
- Instrucción accionable: colocar componentes de dashboard en `frontend/src/components/dashboard`, primitivas reutilizables en `frontend/src/components/ui`, y tipos o cálculos puros en `frontend/src/lib`; usar el alias `@` para imports internos.
- Justificación: esa es la estructura y configuración de alias existente.
- Evidencia concreta: `frontend/components.json`, `frontend/vite.config.ts`, `frontend/src/components/dashboard`, `frontend/src/components/ui`, `frontend/src/lib`.