import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { normalizeCognitoTokens } from "@/lib/auth/cognito-tokens";
import { env } from "@/lib/env";

let cognitoClient: CognitoIdentityProviderClient | null = null;

function getCognitoClient() {
  if (!cognitoClient) {
    cognitoClient = new CognitoIdentityProviderClient({});
  }

  return cognitoClient;
}

export async function signUpWithCognito(input: {
  email: string;
  name: string;
  password: string;
}) {
  return getCognitoClient().send(
    new SignUpCommand({
      ClientId: env.cognito.clientId,
      Password: input.password,
      Username: input.email,
      UserAttributes: [
        { Name: "email", Value: input.email },
        { Name: "name", Value: input.name },
      ],
    }),
  );
}

export async function confirmSignUpWithCognito(input: {
  code: string;
  email: string;
}) {
  return getCognitoClient().send(
    new ConfirmSignUpCommand({
      ClientId: env.cognito.clientId,
      ConfirmationCode: input.code,
      Username: input.email,
    }),
  );
}

export async function resendVerificationCode(input: { email: string }) {
  return getCognitoClient().send(
    new ResendConfirmationCodeCommand({
      ClientId: env.cognito.clientId,
      Username: input.email,
    }),
  );
}

export async function forgotPasswordWithCognito(input: { email: string }) {
  return getCognitoClient().send(
    new ForgotPasswordCommand({
      ClientId: env.cognito.clientId,
      Username: input.email,
    }),
  );
}

export async function confirmForgotPasswordWithCognito(input: {
  code: string;
  email: string;
  password: string;
}) {
  return getCognitoClient().send(
    new ConfirmForgotPasswordCommand({
      ClientId: env.cognito.clientId,
      ConfirmationCode: input.code,
      Password: input.password,
      Username: input.email,
    }),
  );
}

export async function signInWithCognito(input: {
  email: string;
  password: string;
}) {
  const response = await getCognitoClient().send(
    new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        PASSWORD: input.password,
        USERNAME: input.email,
      },
      ClientId: env.cognito.clientId,
    }),
  );

  return normalizeCognitoTokens({
    accessToken: response.AuthenticationResult?.AccessToken,
    expiresIn: response.AuthenticationResult?.ExpiresIn,
    idToken: response.AuthenticationResult?.IdToken,
    refreshToken: response.AuthenticationResult?.RefreshToken,
  });
}

export async function refreshCredentialsSession(refreshToken: string) {
  const response = await getCognitoClient().send(
    new InitiateAuthCommand({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
      ClientId: env.cognito.clientId,
    }),
  );

  return normalizeCognitoTokens({
    accessToken: response.AuthenticationResult?.AccessToken,
    expiresIn: response.AuthenticationResult?.ExpiresIn,
    idToken: response.AuthenticationResult?.IdToken,
    refreshToken: response.AuthenticationResult?.RefreshToken ?? refreshToken,
  });
}
