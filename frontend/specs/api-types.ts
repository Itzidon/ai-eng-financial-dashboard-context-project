export type OperationType = "income" | "outcome";

export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";

export type BusinessType = "B2B" | "B2C";

export interface FacetsResponse {
  /** Operation types available for filtering: "income" or "outcome". */
  operation_types: OperationType[];
  /** Business types available for filtering: "B2B" or "B2C". */
  business_types: BusinessType[];
  /** Categories available for filtering: "suppliers", "sales", "operational", "administrative", or "others". */
  categories: Category[];
  /** Earliest movement date available, formatted as YYYY-MM-DD. */
  min_date: string;
  /** Latest movement date available, formatted as YYYY-MM-DD. */
  max_date: string;
}

export interface AlertEntry {
  /** Aggregated period in YYYY-MM-DD, YYYY-Www, or YYYY-MM format according to the requested grouping. */
  period: string;
  /** Total outcome amount recorded in the period. */
  outcome_total: number;
  /** Average outcome amount across all periods preceding this period. */
  baseline_average: number;
  /** Relative increase over the baseline, expressed as a ratio. */
  increase_ratio: number;
}

export type AlertsResponse = AlertEntry[];

export interface CategoryEntry {
  /** Category represented by the total: "suppliers", "sales", "operational", "administrative", or "others". */
  category: Category;
  /** Operation type represented by the total: "income" or "outcome". */
  operation_type: OperationType;
  /** Aggregated amount for the category and operation type. */
  total_amount: number;
}

export type TopCategoriesResponse = CategoryEntry[];