import { getFriendlyCognitoError } from "@/lib/auth/errors";
import { resendVerificationCode } from "@/lib/auth/cognito";
import { jsonError, jsonSuccess, parseJsonBody } from "@/lib/http/json-route";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const payload = await parseJsonBody(request, forgotPasswordSchema);
  if (!payload.success) {
    return payload.response;
  }

  try {
    await resendVerificationCode(payload.data);

    return jsonSuccess("A new verification code has been sent.");
  } catch (error) {
    return jsonError(
      getFriendlyCognitoError(error),
      400,
      "cognito_resend_verification_failed",
    );
  }
}
