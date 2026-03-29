/**
 * @saas-template/contracts
 *
 * Shared Zod schemas and inferred TypeScript types for all API contracts.
 * These mirror the Python domain models in packages/python/domain-models
 * and are the single source of truth for request/response shapes shared
 * between the Next.js frontend and any other TypeScript consumer.
 *
 * Usage:
 *   import { HealthResponseSchema, ErrorEnvelopeSchema } from "@saas-template/contracts";
 */

// Core API envelopes (success, error, pagination)
export * from "./api";

// Endpoint-specific contracts
export * from "./auth";
export * from "./health";
