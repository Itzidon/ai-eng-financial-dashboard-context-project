# Product

## What it is

A financial metrics dashboard with a React + TypeScript frontend and a FastAPI backend.

Evidence: [README.md](../README.md), [README.es.md](../README.es.md).

## What it does

The frontend fetches financial movements from the backend, computes KPIs (total income,
total outcome, profit, profit margin) and monthly income/outcome/profit data, and renders
them as KPI cards and charts (income vs. outcome, profit margin %).

Evidence: [frontend/src/App.tsx](../frontend/src/App.tsx),
[frontend/src/lib/financial-utils.ts](../frontend/src/lib/financial-utils.ts),
[frontend/src/components/dashboard/kpi-row.tsx](../frontend/src/components/dashboard/kpi-row.tsx),
[frontend/src/components/dashboard/income-outcome-chart.tsx](../frontend/src/components/dashboard/income-outcome-chart.tsx),
[frontend/src/components/dashboard/profit-percent-chart.tsx](../frontend/src/components/dashboard/profit-percent-chart.tsx).

## Domain model

A financial movement (`FinancialMovement`) has: `create_date`, `amount`, `operation_type`
(`income` | `outcome`), `category` (`suppliers` | `sales` | `operational` |
`administrative` | `others`), and `business_type` (`B2B` | `B2C`).

Evidence: [backend/app/routes.py](../backend/app/routes.py),
[frontend/src/lib/financial-types.ts](../frontend/src/lib/financial-types.ts).

The backend also exposes summary, top-categories, comparison, and alert endpoints built
on top of this same movement model, plus B2B/B2C filtered variants.

Evidence: [backend/app/routes.py](../backend/app/routes.py).

## Data source

The backend currently serves simulated/mock financial movements generated in-process
(seeded, deterministic per run), not data from an external database.

Evidence: [backend/app/routes.py](../backend/app/routes.py).
