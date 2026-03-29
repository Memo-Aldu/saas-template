import { confirmSignUpWithCognito } from "@/lib/auth/cognito";
import { getFriendlyCognitoError } from "@/lib/auth/errors";
import { jsonError, jsonSuccess, parseJsonBody } from "@/lib/http/json-route";
import { verifyEmailSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const payload = await parseJsonBody(request, verifyEmailSchema);
  if (!payload.success) {
    return payload.response;
  }

  try {
    await confirmSignUpWithCognito(payload.data);

    return jsonSuccess("Email verified successfully. You can sign in now.");
  } catch (error) {
    return jsonError(
      getFriendlyCognitoError(error),
      400,
      "cognito_verification_failed",
    );
  }
}
