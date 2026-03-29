import { getFriendlyCognitoError } from "@/lib/auth/errors";
import { signUpWithCognito } from "@/lib/auth/cognito";
import { jsonError, jsonSuccess, parseJsonBody } from "@/lib/http/json-route";
import { signUpSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const payload = await parseJsonBody(request, signUpSchema);
  if (!payload.success) {
    return payload.response;
  }

  try {
    await signUpWithCognito(payload.data);

    return jsonSuccess(
      "Account created. Check your inbox for a verification code.",
    );
  } catch (error) {
    return jsonError(
      getFriendlyCognitoError(error),
      400,
      "cognito_signup_failed",
    );
  }
}
