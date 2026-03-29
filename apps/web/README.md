# Web App

Next.js application for a SaaS template.

## Features

- NextAuth session management with Cognito
- Email/password, verification, and password recovery flows
- Shared UI primitives from `@saas-template/ui`
- Shared Zod contracts from `@saas-template/contracts`
- Safer dashboard examples that keep bearer tokens out of browser code

## Environment variables

Copy `.env.example` to `.env.local` and provide real values.

Required:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_COGNITO_REGION`
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- `AUTH_COGNITO_DOMAIN`
- `AUTH_COGNITO_CLIENT_ID`

Optional:

- `AUTH_COGNITO_LOGOUT_URI`
- `AUTH_COGNITO_GOOGLE_ENABLED`
- `AUTH_COGNITO_APPLE_ENABLED`
- `APP_API_BASE_URL`

## Commands

```bash
npm --workspace apps/web run dev
npm --workspace apps/web run lint
npm --workspace apps/web run typecheck
npm --workspace apps/web run test
npm --workspace apps/web run build
```
