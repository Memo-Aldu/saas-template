function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseBoolean(value?: string) {
  return value === "true";
}

function isPlaceholderDomain(value: string) {
  return value.includes("your-domain.auth.");
}

export const env = {
  apiBaseUrl: process.env.APP_API_BASE_URL,
  cognito: {
    appleEnabled: parseBoolean(process.env.AUTH_COGNITO_APPLE_ENABLED),
    clientId: requireEnv("AUTH_COGNITO_CLIENT_ID"),
    domain: requireEnv("AUTH_COGNITO_DOMAIN"),
    googleEnabled: parseBoolean(process.env.AUTH_COGNITO_GOOGLE_ENABLED),
    logoutUri:
      process.env.AUTH_COGNITO_LOGOUT_URI ?? requireEnv("NEXTAUTH_URL"),
    region: requireEnv("NEXT_PUBLIC_COGNITO_REGION"),
    userPoolId: requireEnv("NEXT_PUBLIC_COGNITO_USER_POOL_ID"),
  },
  nextAuth: {
    secret: requireEnv("NEXTAUTH_SECRET"),
    url: requireEnv("NEXTAUTH_URL"),
  },
};

export function isCognitoDomainConfigured() {
  return !isPlaceholderDomain(env.cognito.domain);
}

export function isGoogleAuthEnabled() {
  return env.cognito.googleEnabled && isCognitoDomainConfigured();
}

export function isAppleAuthEnabled() {
  return env.cognito.appleEnabled && isCognitoDomainConfigured();
}

export function getCognitoIssuer() {
  return `https://cognito-idp.${env.cognito.region}.amazonaws.com/${env.cognito.userPoolId}`;
}

export function getCognitoJwksEndpoint() {
  return `${getCognitoIssuer()}/.well-known/jwks.json`;
}
