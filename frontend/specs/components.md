# Frontend component specification

This document specifies presentational React components only. Data retrieval stays
outside these components. API response and query parameter names are not renamed or
extended.

```ts
import type {
  AlertsResponse,
  BusinessType,
  FacetsResponse,
  TopCategoriesResponse,
} from "./api-types";
import type {
  AlertsParams,
  DateRangeFilter,
  TopCategoriesParams,
} from "./param-types";
```

## Date range filter

### `DateRangeFilterControls`

**Purpose:** provide controlled inclusive start and end date inputs for requests that
accept `DateRangeFilter`.

```ts
interface DateRangeFilterControlsProps {
  value: DateRangeFilter;
  facets: FacetsResponse | null;
  disabled: boolean;
  onChange: (value: DateRangeFilter) => void;
  onApply: (value: DateRangeFilter) => void;
  onClear: () => void;
}
```

| Prop | Meaning |
| --- | --- |
| `value` | Current `start_date` and `end_date` values. |
| `facets` | Supplies the verified `min_date` and `max_date` boundaries. `null` means those boundaries are not available. |
| `disabled` | Disables both inputs and the apply/clear actions while the parent cannot accept changes. |
| `onChange` | Receives the complete next `DateRangeFilter` whenever either input changes. An empty input is omitted from the object. |
| `onApply` | Receives the validated range when the user applies it. |
| `onClear` | Requests removal of both date values. |

**Rendering**

- Render two labelled native date inputs bound to `start_date` and `end_date`, plus
  Apply and Clear actions.
- When `facets` is present, use `min_date` and `max_date` as the selectable bounds for
  both inputs. Do not derive or display another date range.
- Clear is enabled only when at least one date is present and `disabled` is false.

**Validation and conditional states**

- Each non-empty value must be a valid `YYYY-MM-DD` date.
- When both dates are present, require `start_date <= end_date`. An inverted range
  displays an inline validation message and disables Apply because the backend does
  not reject this case and would return an empty result.
- When `facets` is present, reject values before `min_date` or after `max_date` and
  disable Apply until corrected.
- **Exactly one date is valid.** A lone `start_date` applies an open-ended range from
  that date; a lone `end_date` applies an open-ended range through that date. The
  component must not synthesize the missing date.
- With neither date present, Apply represents an unbounded range. Clear produces the
  same empty `DateRangeFilter`.
- API boundaries are inclusive, so values equal to `min_date`, `max_date`, or each
  other remain valid.
- If `facets` is `null`, format and chronological-order validation still apply, but no
  dataset boundary is assumed.

**Relationships**

- A parent owns `value` and passes the same `DateRangeFilter` into `AlertsParams` or
  the shared top-category parameters.
- This component does not request `/api/metrics/facets` or any filtered resource.

## Anomaly alerts table

### `AlertsControls`

**Purpose:** edit the verified alert query parameters while delegating date editing
to `DateRangeFilterControls`.

```ts
interface AlertsControlsProps {
  value: AlertsParams;
  facets: FacetsResponse | null;
  disabled: boolean;
  onChange: (value: AlertsParams) => void;
  onApply: (value: AlertsParams) => void;
  onClear: () => void;
}
```

**Rendering and validation**

- Render `DateRangeFilterControls` for `start_date` and `end_date`.
- Render a numeric `threshold` input. Empty means the API default `0.3`; entered
  values must be finite and greater than or equal to `0`.
- Render a grouping selector limited to `day`, `week`, and `month`. Empty means the
  API default `month`.
- Render an optional business-type selector limited to values from
  `facets.business_types`; the verified values are `B2B` and `B2C`. Empty means no
  business-type filter.
- When `facets` is `null`, disable the business-type selector and retain any current
  `business_type` value until verified options are available.
- Apply is disabled when any alert or date validation fails. `threshold: 0` is valid.
- `onApply` receives only verified `AlertsParams` fields and does not insert defaults
  for empty optional inputs.

### `AnomalyAlertsTable`

**Purpose:** render the response from `GET /api/metrics/alerts` without calculating
additional anomaly fields.

```ts
interface AnomalyAlertsTableProps {
  data: AlertsResponse;
  loading: boolean;
  error: string | null;
}
```

**Rendering**

- Render one row per `AlertEntry` with exactly four columns: `period`,
  `outcome_total`, `baseline_average`, and `increase_ratio`.
- Display `outcome_total` and `baseline_average` as currency while retaining their
  numeric values as the data source.
- Display `increase_ratio` as a percentage derived only for presentation; do not add
  a percentage field to the response model.
- Preserve the response order. Do not infer alerts for missing periods.

**Conditional and empty states**

- While `loading` is true, render a stable table-shaped skeleton and no data rows.
- When `loading` is false and `error` is non-null, render the supplied error message
  instead of the table body.
- **When `loading` is false, `error` is null, and `data` is empty, render an explicit
  empty state: `No anomaly alerts for the selected filters.`** Keep the column headers
  visible so the response shape remains clear.
- An empty response is not an error. It can mean no period exceeded `threshold`, no
  data matched the date range, or there was insufficient non-zero history.
- A single returned entry renders normally. Numeric zero values render as zero and
  must not be treated as missing.

### `AnomalyAlertsSection`

**Purpose:** compose alert controls and the table while keeping request execution in
the owning page or data layer.

```ts
interface AnomalyAlertsSectionProps {
  params: AlertsParams;
  facets: FacetsResponse | null;
  data: AlertsResponse;
  loading: boolean;
  error: string | null;
  onParamsChange: (value: AlertsParams) => void;
  onApply: (value: AlertsParams) => void;
  onClear: () => void;
}
```

`AnomalyAlertsSection` passes parameter props to `AlertsControls`, passes response
state to `AnomalyAlertsTable`, and disables controls while `loading`. It performs no
fetch and does not mutate `AlertsResponse`.

## B2B versus B2C top-five comparison

The verified API has no combined B2B/B2C response. The owning data layer must request
`GET /api/metrics/categories/top` twice using the same shared filters:

```ts
type SharedTopCategoriesParams = Omit<
  TopCategoriesParams,
  "business_type" | "limit"
>;

const b2bParams: TopCategoriesParams = {
  ...sharedParams,
  business_type: "B2B",
  limit: 5,
};

const b2cParams: TopCategoriesParams = {
  ...sharedParams,
  business_type: "B2C",
  limit: 5,
};
```

### `TopCategoriesControls`

**Purpose:** edit the filters shared by both top-five requests.

```ts
interface TopCategoriesControlsProps {
  value: SharedTopCategoriesParams;
  facets: FacetsResponse | null;
  disabled: boolean;
  onChange: (value: SharedTopCategoriesParams) => void;
  onApply: (value: SharedTopCategoriesParams) => void;
  onClear: () => void;
}
```

**Rendering and validation**

- Render `DateRangeFilterControls` for the optional inclusive date range.
- Render an operation-type selector restricted to values in
  `facets.operation_types`; the verified values are `income` and `outcome`. Empty
  means the API default `outcome`.
- When `facets` is `null`, disable the operation-type selector and retain any current
  `operation_type` value until verified options are available.
- Do not render controls for `business_type` or `limit`; the comparison fixes those
  independently to `B2B`/`B2C` and `5`.
- Reuse all date validation and one-date behavior from `DateRangeFilterControls`.
- Apply is disabled while invalid or when `disabled` is true. Do not synthesize API
  defaults for an empty operation type.

### `TopCategoriesList`

**Purpose:** render one channel's top-category response.

```ts
interface TopCategoriesListProps {
  businessType: BusinessType;
  data: TopCategoriesResponse;
  loading: boolean;
  error: string | null;
}
```

**Rendering and conditional states**

- Render a heading from `businessType` and up to five entries in response order.
- Each entry displays exactly `category`, `operation_type`, and `total_amount`.
- Format `total_amount` as currency without adding a formatted response field.
- While loading, render a stable five-row skeleton.
- On error, show the supplied error for that channel; the other channel remains
  independently renderable.
- **For an empty B2B response, render `No B2B categories for the selected filters.`**
- **For an empty B2C response, render `No B2C categories for the selected filters.`**
- Empty data is not an error. Do not add placeholder categories or zero-valued rows.
- If the API returns fewer than five entries, render only those entries. If a caller
  supplies more than five, render only the first five because this view is explicitly
  top-five.
- Preserve the API order, which is descending by `total_amount`; do not recompute or
  merge totals.

### `B2BvsB2CComparison`

**Purpose:** present both independently loaded top-five responses side by side.

```ts
interface B2BvsB2CComparisonProps {
  params: SharedTopCategoriesParams;
  facets: FacetsResponse | null;
  b2bData: TopCategoriesResponse;
  b2cData: TopCategoriesResponse;
  b2bLoading: boolean;
  b2cLoading: boolean;
  b2bError: string | null;
  b2cError: string | null;
  onParamsChange: (value: SharedTopCategoriesParams) => void;
  onApply: (value: SharedTopCategoriesParams) => void;
  onClear: () => void;
}
```

`B2BvsB2CComparison` renders one `TopCategoriesControls` followed by two
`TopCategoriesList` instances, one with `businessType="B2B"` and one with
`businessType="B2C"`. Each list keeps its own loading, error, data, and empty state so
one response never hides the other. Controls are disabled while either request is
loading. The component neither fetches nor combines the two response arrays.