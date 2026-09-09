# Current state

## What works (✅ verified)

- `docker compose up --build` builds and starts both `frontend` and `backend`
  containers successfully.
- Backend responds directly: `GET /health` → `200` `{"status":"ok"}`,
  `GET /api/metrics` → `200` with financial movements, `GET /docs` → `200`.
- Frontend root `http://localhost:5173/` → `200`.
- Backend test suite: 16 tests passing (`docker compose exec -T backend pytest`),
  including route filters, facets, summary, top categories, comparison, alerts,
  B2B/B2C endpoints, and a contract-field check against `FinancialMovement`.
- Frontend test suite: 8 tests passing (`docker compose exec -T frontend npm test`),
  covering `computeKPIs`, `computeMonthlyData`, `computePeriodLabel`, and formatters.
- Frontend lint (`npm run lint`) and build (`npm run build`) both succeed.
- The dashboard period label is computed from actual movement dates
  (`computePeriodLabel`) instead of a fixed string.
- Mock data generation (`generate_mock_movements`) uses a local `random.Random(seed)`
  instance instead of mutating the global `random` module state.

Evidence: [verification.md](../verification.md),
[engineering-findings.md](../engineering-findings.md),
[backend/tests/test_routes.py](../backend/tests/test_routes.py),
[frontend/src/lib/financial-utils.test.ts](../frontend/src/lib/financial-utils.test.ts),
[backend/app/routes.py](../backend/app/routes.py).

## Known problems / gaps

- ❓ **Frontend-to-backend proxy timeout — cause not determined.** Requests to
  `http://localhost:5173/api/metrics` (and `/api/metrics/facets`) time out after 10
  seconds, even though the backend responds directly on `http://localhost:8000` and
  from within its own container. Requests from inside the `frontend` container to
  `backend:8000` and to the backend's internal IP also time out. No file or test in
  this repository explains the cause; it must not be attributed to DNS, Docker
  networking, or configuration without further evidence. A diagnostic check
  (`npm run check:proxy`) reproduces and reports this as a known, non-blocking result,
  separate from the required test suite.

  Evidence: [verification.md](../verification.md),
  [engineering-findings.md](../engineering-findings.md),
  [frontend/scripts/check-api-proxy.mjs](../frontend/scripts/check-api-proxy.mjs),
  [.agents/rules/integration-validation.md](../.agents/rules/integration-validation.md).

- No integration test exercises the real proxy path (browser → Vite → backend) inside
  the automated `npm test` / `pytest` suites; `check:proxy` is a manual/diagnostic
  script, not part of the enforced test suites.

  Evidence: [frontend/package.json](../frontend/package.json),
  [frontend/scripts/check-api-proxy.mjs](../frontend/scripts/check-api-proxy.mjs).

- The `FinancialMovement` contract is duplicated between backend (Pydantic model) and
  frontend (TypeScript interface). A backend test now pins the current field set, but
  it does not automatically fail if only the frontend type changes.

  Evidence: [backend/app/routes.py](../backend/app/routes.py),
  [frontend/src/lib/financial-types.ts](../frontend/src/lib/financial-types.ts),
  [backend/tests/test_routes.py](../backend/tests/test_routes.py).

- CORS allows all origins with credentials (`allow_origins=["*"]`,
  `allow_credentials=True`), which is permissive and was not scoped down.

  Evidence: [backend/app/main.py](../backend/app/main.py).

- The production frontend bundle is 584.49 kB minified, above Vite's 500 kB warning
  threshold; Recharts is imported directly in both chart components without code
  splitting.

  Evidence: [frontend/package.json](../frontend/package.json),
  [frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx),
  [frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx).

## Next priorities justified by repo evidence

- Investigate the frontend-backend proxy timeout with additional, reproducible
  diagnostics (e.g. network captures or Vite/Node debug logs) before attempting any
  fix, per the existing rule against attributing causes without evidence.

  Evidence: [.agents/rules/integration-validation.md](../.agents/rules/integration-validation.md).

- Add an automated integration check that exercises `/api/metrics` through the actual
  Vite proxy as part of a maintained (not necessarily blocking) verification step,
  building on the existing `check:proxy` script.

  Evidence: [frontend/scripts/check-api-proxy.mjs](../frontend/scripts/check-api-proxy.mjs),
  [.agents/rules/integration-validation.md](../.agents/rules/integration-validation.md).

- Keep the `FinancialMovement` contract test in sync whenever either side of the
  contract changes, per the documented rule.

  Evidence: [backend/tests/test_routes.py](../backend/tests/test_routes.py),
  [.agents/rules/data-contracts.md](../.agents/rules/data-contracts.md).
