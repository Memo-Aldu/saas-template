/**
 * Core API envelope schemas - mirrors domain_models/api.py and domain_models/errors.py.
 *
 * All backend responses are wrapped in one of these shapes so the frontend
 * can handle them generically without ad-hoc type casting.
 */

import { z } from "zod";

// Error schemas

/** A single field-level validation error detail (mirrors ErrorDetail). */
export const ErrorDetailSchema = z.object({
  field: z.string().nullable().optional(),
  reason: z.string(),
});
export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;

/** The standard error envelope returned on 4xx / 5xx (mirrors ErrorEnvelope). */
export const ErrorEnvelopeSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.array(ErrorDetailSchema).nullable().optional(),
});
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

// Success schemas

/** Generic success response - data is an open record (mirrors SuccessResponse). */
export const SuccessResponseSchema = z.object({
  message: z.string(),
  data: z.record(z.string(), z.unknown()).nullable().optional(),
});
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

/**
 * Type-safe success response where the data shape is known.
 *
 * @example
 * const HealthResponseSchema = TypedSuccessResponseSchema(HealthDataSchema);
 * type HealthResponse = z.infer<typeof HealthResponseSchema>;
 */
export const TypedSuccessResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
) =>
  z.object({
    message: z.string(),
    data: dataSchema,
  });

// Pagination

/**
 * Generic paginated result factory (mirrors PaginatedResult[T]).
 *
 * @example
 * const PagedUsers = PaginatedResultSchema(UserSchema);
 */
export const PaginatedResultSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    items: z.array(itemSchema),
    next_cursor: z.string().nullable(),
    total_pages: z.number().int().nullable(),
    total_items: z.number().int().nullable(),
    page_size: z.number().int().nullable(),
  });

export type PaginatedResult<T> = {
  items: T[];
  next_cursor: string | null;
  total_pages: number | null;
  total_items: number | null;
  page_size: number | null;
};
