import { forgotPasswordWithCognito } from "@/lib/auth/cognito";
import { getFriendlyCognitoError } from "@/lib/auth/errors";
import { jsonError, jsonSuccess, parseJsonBody } from "@/lib/http/json-route";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const payload = await parseJsonBody(request, forgotPasswordSchema);
  if (!payload.success) {
    return payload.response;
  }

  try {
    await forgotPasswordWithCognito(payload.data);

    return jsonSuccess("Reset instructions have been sent to your email.");
  } catch (error) {
    return jsonError(
      getFriendlyCognitoError(error),
      400,
      "cognito_forgot_password_failed",
    );
  }
}
