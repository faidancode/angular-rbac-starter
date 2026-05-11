# Phase 1: Security Implementation Details

This document outlines the changes made to the Angular RBAC Starter codebase to implement Phase 1 of the `implementation_plan.md` focusing on security hardening.

## What Was Implemented

### 1. Secure Token Storage (Addressed 1.1)
- **Previous Behavior**: The `accessToken`, `user` object, and `permissions` array were stored in plain text inside `localStorage`, exposing them to Cross-Site Scripting (XSS) attacks.
- **New Behavior**: 
  - `accessToken`, `user`, and `permissions` are now strictly kept **in-memory** within the `AuthService` state signals.
  - Only `hris_refresh_token` is persisted to `localStorage` (this can be later converted to a backend `HttpOnly` cookie for even stronger security without modifying the core frontend architecture).

### 2. Refresh Token Flow & Initialization (Addressed 1.3 & 1.4)
- **Previous Behavior**: Tokens never silently refreshed. When a 401 occurred, the user was unceremoniously logged out.
- **New Behavior**: 
  - Added a `/auth/refresh` HTTP call in `AuthService.refreshToken()`.
  - Implemented an `APP_INITIALIZER` in `app.config.ts`. On application startup/reload, the app now checks for the refresh token and attempts to hydrate the user session *before* running the route guards. This avoids a race condition where a page reload would flash a "logged out" state before the token refreshed.
  - Intercepted `401 Unauthorized` responses in `auth.interceptor.ts`. It now queues any inflight requests, successfully refreshes the token, and retries the failed requests automatically.

### 3. Environment Imports (Addressed 1.2)
- **Previous Behavior**: Both `auth.service.ts` and `base-api.service.ts` directly imported `environment.development.ts`, forcing production builds to use development URLs.
- **New Behavior**: Changed all imports to point to `environment.ts` so Angular's build system can dynamically swap it with `environment.production.ts` during build.

## Tips, Tricks, and Best Practices

### 🟢 DOs
- **Always use `APP_INITIALIZER`** when hydrating from an API on startup. Without it, the router will evaluate guards based on the default "empty" state of your signals/observables and redirect authenticated users to `/login`.
- **Use a Subject for Refresh Queues**: When multiple requests fail with a `401` simultaneously, you only want to call the refresh API *once*. The `BehaviorSubject` acts as a semaphore. Other failed requests wait for the subject to emit the new token before retrying.
- **Rely on the Backend for Truth**: The frontend permissions stored in memory are *strictly* for UX (hiding buttons, blocking routes). Actual security enforcement must happen at the API layer.

### 🔴 DON'Ts
- **Don't store `accessToken` in `localStorage`**: Even if it seems convenient for surviving page reloads, it's the primary target for malicious browser extensions or XSS payloads. 
- **Don't use `err.statusCode` for Angular HTTP Errors**: Angular's `HttpErrorResponse` uses `err.status`. Always double-check standard interface properties to prevent silent failures in catch blocks.

## Future Recommendations (CSRF)
If the backend eventually transitions from sending the `refreshToken` in a JSON payload to setting it as an `HttpOnly` cookie, ensure the backend also implements Double Submit Cookie or proper CORS policies to protect against Cross-Site Request Forgery (CSRF). The Angular `HttpClientXsrfModule` can be easily added to automatically include `X-XSRF-TOKEN` headers for requests.
