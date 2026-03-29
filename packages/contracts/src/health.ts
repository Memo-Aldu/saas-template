/**
 * Health-check endpoint contract.
 *
 * GET /skeleton/health -> SuccessResponse whose data block matches HealthData.
 */

import { z } from "zod";
import { TypedSuccessResponseSchema } from "./api";

export const HealthDataSchema = z.object({
  service: z.string(),
  version: z.string(),
  environment: z.string(),
});
export type HealthData = z.infer<typeof HealthDataSchema>;

export const HealthResponseSchema = TypedSuccessResponseSchema(HealthDataSchema);
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
