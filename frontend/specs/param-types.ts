import type { BusinessType, OperationType } from "./api-types";

export interface DateRangeFilter {
  /** Inclusive initial date of the filter, formatted as YYYY-MM-DD. */
  start_date?: string;
  /** Inclusive final date of the filter, formatted as YYYY-MM-DD. */
  end_date?: string;
}

export interface AlertsParams extends DateRangeFilter {
  /** Minimum outcome increase ratio; must be greater than or equal to 0 and defaults to 0.3. */
  threshold?: number;
  /** Period grouping used to calculate alerts: "day", "week", or "month"; defaults to "month". */
  group_by?: "day" | "week" | "month";
  /** Business type used to filter movements: "B2B" or "B2C". */
  business_type?: BusinessType;
}

export interface TopCategoriesParams extends DateRangeFilter {
  /** Operation type used to rank categories: "income" or "outcome"; defaults to "outcome". */
  operation_type?: OperationType;
  /** Maximum number of categories returned; integer from 1 to 20 and defaults to 5. */
  limit?: number;
  /** Business type used to filter movements: "B2B" or "B2C". */
  business_type?: BusinessType;
}