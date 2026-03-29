import { confirmForgotPasswordWithCognito } from "@/lib/auth/cognito";
import { getFriendlyCognitoError } from "@/lib/auth/errors";
import { jsonError, jsonSuccess, parseJsonBody } from "@/lib/http/json-route";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const payload = await parseJsonBody(request, resetPasswordSchema);
  if (!payload.success) {
    return payload.response;
  }

  try {
    await confirmForgotPasswordWithCognito({
      code: payload.data.code,
      email: payload.data.email,
      password: payload.data.password,
    });

    return jsonSuccess("Password reset successfully. You can sign in now.");
  } catch (error) {
    return jsonError(
      getFriendlyCognitoError(error),
      400,
      "cognito_reset_password_failed",
    );
  }
}
