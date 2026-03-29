import { z } from "zod";

import { ErrorEnvelopeSchema } from "@saas-template/contracts";

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

export async function fetchContract<TSchema extends z.ZodTypeAny>(
  input: RequestInfo | URL,
  init: RequestInit,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  const response = await fetch(input, init);
  const json = (await response.json()) as unknown;

  if (!response.ok) {
    const parsedError = ErrorEnvelopeSchema.safeParse(json);
    throw new ApiClientError(
      parsedError.success ? parsedError.data.message : "Request failed.",
      response.status,
    );
  }

  return schema.parse(json);
}
