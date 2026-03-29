const FRIENDLY_COGNITO_ERRORS: Record<string, string> = {
  CodeMismatchException:
    "That verification code is incorrect. Please try again.",
  ExpiredCodeException:
    "That code has expired. Request a new one and try again.",
  InvalidPasswordException:
    "Your password does not meet the current security requirements.",
  LimitExceededException:
    "Too many attempts were made. Please wait a moment and try again.",
  NotAuthorizedException: "The email or password you entered is incorrect.",
  TooManyFailedAttemptsException:
    "Too many failed attempts. Please wait a moment before trying again.",
  TooManyRequestsException:
    "Too many requests were made. Please wait a moment and try again.",
  UserNotConfirmedException:
    "Your email address still needs to be verified before you can continue.",
  UserNotFoundException: "We couldn't find an account for that email address.",
  UsernameExistsException:
    "An account with that email already exists. Try signing in instead.",
  OAuthAccountNotLinked:
    "That email is already associated with a different sign-in method. Use the original provider or contact support.",
  OAuthCallback: "We couldn't complete that social sign-in. Please try again.",
  OAuthSignin: "We couldn't start that social sign-in. Please try again.",
  CredentialsSignin: "The email or password you entered is incorrect.",
  AccessDenied: "We couldn't sign you in with that account.",
  Callback: "Something interrupted sign in. Please try again.",
  RefreshAccessTokenError: "Your session ended. Please sign in again.",
};

export function getFriendlyCognitoError(error: unknown) {
  if (error instanceof Error) {
    return FRIENDLY_COGNITO_ERRORS[error.name] ?? error.message;
  }

  return "Something went wrong. Please try again.";
}

export function getFriendlyAuthError(error?: string | null) {
  if (!error) {
    return null;
  }

  return (
    FRIENDLY_COGNITO_ERRORS[error] ??
    "Sign-in couldn't be completed. Please try again."
  );
}
