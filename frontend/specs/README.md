# Verified frontend feature specifications

This directory defines the verified API contracts and component behavior for three
financial dashboard features. A coding agent implementing them must use the existing
Vite API base URL pattern, keep query parameter names in snake case, and must not add
response fields that are absent from these contracts.

## Sources of truth

- [`api-types.ts`](./api-types.ts) defines verified response shapes and API literals.
- [`param-types.ts`](./param-types.ts) defines verified optional query parameters.
- [`components.md`](./components.md) defines component names, props, rendering,
  validation, loading, error, and empty states.
- [`../src/lib/financial-types.ts`](../src/lib/financial-types.ts) defines the existing
  `FinancialMovement` response item consumed by the dashboard.

```ts
import type {
  AlertsResponse,
  Category,
  FacetsResponse,
  OperationType,
  TopCategoriesResponse,
} from "./api-types";
import type {
  AlertsParams,
  DateRangeFilter,
  TopCategoriesParams,
} from "./param-types";
import type { FinancialMovement } from "../src/lib/financial-types";
```

All endpoints below use HTTP `GET`. Every documented query parameter is optional;
there are no required query parameters for these features.

## Date range filter

### API contract

#### `GET /api/metrics/facets`

- Query parameters: none.
- Response type: `FacetsResponse`.
- Response fields: `operation_types`, `business_types`, `categories`, `min_date`, and
  `max_date`.
- `min_date` and `max_date` are strings in `YYYY-MM-DD` format and describe the
  available movement-date boundaries.

#### `GET /api/metrics`

The date-filter feature sends a `DateRangeFilter`. The complete verified query shape
accepted by this endpoint is:

```ts
type MetricsParams = DateRangeFilter & {
  category?: Category;
  operation_type?: OperationType;
};
```

| Query parameter | Required | Type and valid values | Default when omitted |
| --- | --- | --- | --- |
| `start_date` | No | `string`, `YYYY-MM-DD` | No lower date bound |
| `end_date` | No | `string`, `YYYY-MM-DD` | No upper date bound |
| `category` | No | `suppliers`, `sales`, `operational`, `administrative`, `others` | All categories |
| `operation_type` | No | `income`, `outcome` | Both operation types |

- Response type: `FinancialMovement[]`.
- Every item contains exactly `create_date`, `amount`, `operation_type`, `category`,
  and `business_type`.
- Results are ordered by `create_date`. Both date boundaries are inclusive.

### UI interpretation

- Use `FacetsResponse.min_date` and `FacetsResponse.max_date` as the selectable input
  bounds when facets are available.
- Pass entered dates without changing their `YYYY-MM-DD` representation.
- Recompute the existing dashboard metrics, charts, and period label from the returned
  `FinancialMovement[]`; do not derive movements outside the response.
- Follow `DateRangeFilterControls` in [`components.md`](./components.md): both dates
  are controlled, Clear removes both, and Apply emits only validated fields.

### Concrete edge cases

1. **Only `start_date` is entered:** accept and apply it as an open-ended range from
   that inclusive date. Do not invent `end_date`.
2. **Only `end_date` is entered:** accept and apply it as an open-ended range through
   that inclusive date. Do not invent `start_date`.
3. **`start_date` is later than `end_date`:** disable Apply and show inline validation.
   The backend does not reject the range and would otherwise return `[]`.
4. **The response is `[]`:** show the dashboard's no-data state rather than zero-valued
   fabricated movements.
5. **A date equals `min_date`, `max_date`, or the other entered date:** accept it;
   boundaries are inclusive.

## Anomaly alerts

### API contract

#### `GET /api/metrics/alerts`

- Request/query type: `AlertsParams`.
- Response type: `AlertsResponse`, an array of `AlertEntry`.

| Query parameter | Required | Type and valid values | Default when omitted |
| --- | --- | --- | --- |
| `threshold` | No | finite `number` greater than or equal to `0` | `0.3` |
| `group_by` | No | `day`, `week`, `month` | `month` |
| `start_date` | No | `string`, `YYYY-MM-DD` | No lower date bound |
| `end_date` | No | `string`, `YYYY-MM-DD` | No upper date bound |
| `business_type` | No | `B2B`, `B2C` | Both business types |

Each response item has exactly:

| Field | Type | UI meaning |
| --- | --- | --- |
| `period` | `string` | Group label: `YYYY-MM-DD` for day, `YYYY-Www` for ISO week, or `YYYY-MM` for month |
| `outcome_total` | `number` | Outcome amount for the period; display as currency |
| `baseline_average` | `number` | Average outcome amount across preceding periods; display as currency |
| `increase_ratio` | `number` | Relative increase over the baseline; format as a percentage for display without adding a response field |

The backend returns an entry only when `increase_ratio` is strictly greater than
`threshold`. Preserve response order and do not infer entries for missing periods.

### UI interpretation

- `AlertsControls` owns `AlertsParams`; `AnomalyAlertsTable` consumes
  `AlertsResponse`; `AnomalyAlertsSection` composes both as specified in
  [`components.md`](./components.md).
- Omitted `threshold` and `group_by` use backend defaults. Do not insert those defaults
  into an otherwise empty parameter object.
- Treat `[]` as a successful result, not as a request failure.

### Concrete edge cases

1. **The response is `[]`:** retain the four table headers and show
   `No anomaly alerts for the selected filters.` This may mean no threshold breach,
   no matching data, or insufficient non-zero history.
2. **`threshold` is `0`:** accept it. Zero is the verified minimum, not an empty value.
3. **`threshold` is negative or non-finite:** disable Apply and show input validation;
   do not send the invalid value. The API rejects negative values with `422`.
4. **Only one date is entered:** use the same valid open-ended behavior as the date
   range filter; do not synthesize the missing boundary.
5. **A returned numeric field is `0`:** render zero in its normal currency or
   percentage format; do not treat it as missing.

## B2B versus B2C comparison

### API contract

There is no endpoint returning a combined B2B/B2C comparison. Use the same verified
endpoint twice:

- `GET /api/metrics/categories/top` with `business_type=B2B` and `limit=5`.
- `GET /api/metrics/categories/top` with `business_type=B2C` and `limit=5`.

Both requests use `TopCategoriesParams`; both responses use
`TopCategoriesResponse`, an array of `CategoryEntry`.

| Query parameter | Required | Type and valid values | Default when omitted |
| --- | --- | --- | --- |
| `operation_type` | No | `income`, `outcome` | `outcome` |
| `limit` | No | integer from `1` through `20` | `5` |
| `start_date` | No | `string`, `YYYY-MM-DD` | No lower date bound |
| `end_date` | No | `string`, `YYYY-MM-DD` | No upper date bound |
| `business_type` | No | `B2B`, `B2C` | Both business types |

For this feature, `business_type` and `limit` are not user-controlled: set them to
`B2B`/`B2C` and `5` respectively. Share only `operation_type`, `start_date`, and
`end_date` between requests.

Each response item has exactly:

| Field | Type | UI meaning |
| --- | --- | --- |
| `category` | `Category` | Category label |
| `operation_type` | `OperationType` | Whether the ranked total represents income or outcome |
| `total_amount` | `number` | Aggregated category amount; display as currency |

Results are ordered by descending `total_amount`. Do not merge B2B and B2C entries or
recalculate totals in the UI.

### UI interpretation

- `TopCategoriesControls` edits the shared subset of `TopCategoriesParams`.
- `B2BvsB2CComparison` renders two independent `TopCategoriesList` instances with
  independent data, loading, error, and empty states.
- Render at most the first five entries from each response and preserve API order.
- A failure or empty response for one channel must not hide a successful response for
  the other channel.

### Concrete edge cases

1. **B2B returns `[]`:** show `No B2B categories for the selected filters.` while
   rendering B2C independently.
2. **B2C returns `[]`:** show `No B2C categories for the selected filters.` while
   rendering B2B independently.
3. **A response contains fewer than five entries:** render only those entries; do not
   add placeholder categories or zero-valued rows.
4. **Only one request fails:** show that channel's error while retaining the other
   channel's successful data or empty state.
5. **Only one date is entered:** send the same open-ended boundary in both requests;
   do not synthesize the missing date.

## Implementation boundaries

- Keep API execution outside the presentational components in
  [`components.md`](./components.md).
- Follow the existing `VITE_API_BASE_URL` convention when implementation begins.
- Distinguish loading, error, and empty responses; an empty array is not an error.
- Do not rename snake-case API fields in response contracts.
- Do not add `any`, `object`, unchecked response fields, or alternate endpoint names.
- This specification contains no React implementation and no API call implementation.