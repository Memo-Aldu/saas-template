const BUILD_ENV_FALLBACKS: Record<string, string> = {
  AUTH_COGNITO_CLIENT_ID: "build-placeholder-client-id",
  AUTH_COGNITO_DOMAIN: "your-domain.auth.us-east-1.amazoncognito.com",
  NEXTAUTH_SECRET: "build-placeholder-nextauth-secret",
  NEXTAUTH_URL: "http://localhost:3000",
  NEXT_PUBLIC_COGNITO_REGION: "us-east-1",
  NEXT_PUBLIC_COGNITO_USER_POOL_ID: "us-east-1_build-placeholder",
};

function isBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (value) {
    return value;
  }

  if (isBuildPhase()) {
    const fallback = BUILD_ENV_FALLBACKS[name];
    if (fallback) {
      return fallback;
    }
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

function parseBoolean(value?: string) {
  return value === "true";
}

function isPlaceholderDomain(value: string) {
  return value.includes("your-domain.auth.");
}

export const env = {
  get apiBaseUrl() {
    return process.env.APP_API_BASE_URL;
  },
  cognito: {
    get appleEnabled() {
      return parseBoolean(process.env.AUTH_COGNITO_APPLE_ENABLED);
    },
    get clientId() {
      return requireEnv("AUTH_COGNITO_CLIENT_ID");
    },
    get domain() {
      return requireEnv("AUTH_COGNITO_DOMAIN");
    },
    get googleEnabled() {
      return parseBoolean(process.env.AUTH_COGNITO_GOOGLE_ENABLED);
    },
    get logoutUri() {
      return process.env.AUTH_COGNITO_LOGOUT_URI ?? requireEnv("NEXTAUTH_URL");
    },
    get region() {
      return requireEnv("NEXT_PUBLIC_COGNITO_REGION");
    },
    get userPoolId() {
      return requireEnv("NEXT_PUBLIC_COGNITO_USER_POOL_ID");
    },
  },
  nextAuth: {
    get secret() {
      return requireEnv("NEXTAUTH_SECRET");
    },
    get url() {
      return requireEnv("NEXTAUTH_URL");
    },
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
