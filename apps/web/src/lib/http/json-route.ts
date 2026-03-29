import { NextResponse } from "next/server";
import { z } from "zod";

type ErrorDetail = {
  field?: string | null;
  reason: string;
};

export function jsonError(
  message: string,
  status: number,
  code = "bad_request",
  details?: ErrorDetail[],
) {
  return NextResponse.json(
    {
      code,
      details,
      message,
    },
    { status },
  );
}

export function jsonSuccess<TData>(
  message: string,
  data?: TData,
  status = 200,
) {
  return NextResponse.json(
    {
      data: data ?? null,
      message,
    },
    { status },
  );
}

export async function parseJsonBody<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
): Promise<
  | { success: true; data: z.infer<TSchema> }
  | { success: false; response: NextResponse }
> {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return {
      response: jsonError(
        "Request body must be valid JSON.",
        400,
        "invalid_json",
      ),
      success: false,
    };
  }

  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      response: jsonError(
        parsed.error.issues[0]?.message ?? "Invalid request.",
        400,
        "validation_error",
        parsed.error.issues.map((issue) => ({
          field:
            issue.path.length > 0
              ? issue.path.map((segment) => String(segment)).join(".")
              : null,
          reason: issue.message,
        })),
      ),
      success: false,
    };
  }

  return { data: parsed.data, success: true };
}
