# Production-Ready Improvement Plan — Angular RBAC Starter

## Overview

This document captures a thorough code-review of the current codebase and proposes concrete improvements to make it **production-ready**. Issues are grouped by category, ordered by severity/impact.

---

## 1. Security

### 1.1 Sensitive Data in `localStorage` (HIGH)
**Files:** `auth.service.ts`

The JWT access token, user object, and permissions array are all stored in plain `localStorage`. This makes them vulnerable to XSS attacks — any injected script can steal the token.

**Improvements:**
- Store the **access token in memory** (an in-memory signal, not localStorage). Only the **refresh token** should be persisted, and ideally in an `HttpOnly` cookie (server-side).
- If `localStorage` must be used for the access token, apply short expiry times and scope carefully.
- Never store the full permissions array in `localStorage` in cleartext. Re-fetch or derive them from the access token on app init instead.

```typescript
// auth.service.ts — proposed approach
private readonly _token = signal<string | null>(null); // in-memory only
```

---

### 1.2 Environment File Imports the Wrong Env in Production (HIGH)
**Files:** `auth.service.ts`, `base-api.service.ts`

Both files import from `environment.development.ts` directly:
```typescript
import { environment } from '../../../environments/environment.development';
```
This means the production build will use the development API URL. The correct pattern is to import from `environment.ts` and let Angular's file replacements swap it at build time.

**Fix:**
```typescript
// Always import from the generic environment file
import { environment } from '../../../environments/environment';
```
Also confirm `angular.json` has the `fileReplacements` block configured for the `production` build configuration.

---

### 1.3 No Token Expiry / Refresh Token Logic (HIGH)
**Files:** `auth.service.ts`, `auth.interceptor.ts`

Currently there is no JWT expiry check. If the token expires, the user gets a `401` and is simply logged out. There is no silent refresh mechanism.

**Improvements:**
- Implement a **refresh token flow** in `auth.interceptor.ts`: on `401`, attempt `POST /auth/refresh` with the stored refresh token, retry the original request, and only then navigate to login on failure.
- Decode the JWT `exp` claim on login to schedule a proactive refresh before expiry.

---

### 1.4 Permissions Tamperable via `localStorage` (MEDIUM)
**Files:** `auth.service.ts`, `ability.service.ts`

Permissions are restored directly from `localStorage` on app startup. A user could edit `hris_permissions` in DevTools to gain elevated access. Client-side RBAC is always advisory, but this is trivially bypassed.

**Improvements:**
- Always enforce permissions on the **backend** (the Angular RBAC is only for UX, not a security boundary — document this clearly).
- Optionally, derive permissions from a server-signed JWT payload instead of a raw JSON array.

---

### 1.5 No CSRF Protection (MEDIUM)
For non-cookie-based auth this is less critical, but once a `HttpOnly` cookie refresh approach is used, CSRF tokens will be required. Plan for this early.

---

## 2. Code Quality & Architecture

### 2.1 Massive State Duplication Across Services (HIGH)
**Files:** `employee.service.ts`, `user.service.ts`, `department.service.ts`, `position.service.ts`, `role.service.ts`

Every resource service duplicates ~50 lines of identical pagination/search/sort signal state and `fetchAll` logic. This creates a maintenance burden — any bug fix must be applied in 5+ places.

**Improvement:** Extract a **generic `ResourceService<T>` base class** or a reusable `PaginatedState<T>` signal store abstraction:

```typescript
// core/services/paginated-resource.service.ts
export abstract class PaginatedResourceService<T> extends BaseApiService {
  protected abstract endpoint: string;

  private _items = signal<T[]>([]);
  private _loading = signal(false);
  private _total = signal(0);
  private _page = signal(1);
  private _limit = signal(10);
  private _searchQuery = signal('');
  private _sort = signal('createdAt:desc');
  private _hasNextPage = signal(false);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  // ... etc.

  fetchAll(page = 1, append = false, search = '', limit = 10, sort = 'createdAt:desc') {
    // shared implementation
  }
}
```

---

### 2.2 `console.log` Statements in Production Code (MEDIUM)
**Files:** `employee.service.ts` (line 55), `dashboard.component.ts` (line 43)

```typescript
console.log('Fetching with params:', params); // employee.service.ts
console.log(summary);                         // dashboard.component.ts
```

These must be removed before production. Replace with a structured `LoggerService` that is a no-op in production (`environment.production === true`).

---

### 2.3 `parsePermission` Helper is Duplicated in 3 Places (MEDIUM)
**Files:** `auth.guard.ts`, `has-permission.directive.ts`, `sidebar.component.ts`

The same function is copy-pasted in three places with slightly different logic (e.g. which separator takes priority — `.` vs `:`). This creates inconsistency risk.

**Fix:** Extract to `core/utils/permission.utils.ts` and import from a single source:

```typescript
// core/utils/permission.utils.ts
export function parsePermission(value: string): { action: string; subject: string } {
  const separator = value.includes(':') ? ':' : '.';
  const [subject, action] = value.split(separator);
  return { action, subject };
}
```

---

### 2.4 `AppPermission` Type Not Used for Type-Safety (MEDIUM)
**Files:** `permission.type.ts`, `auth.guard.ts`, `app.routes.ts`

A well-typed `AppPermission` union type is defined (`Subject.Action`) but the `permissionGuard()` and `hasPermission` directive accept plain `string`, losing all type safety.

**Fix:**
```typescript
// Use the AppPermission type for strict checking
export const permissionGuard = (permission: AppPermission): CanActivateFn => ...
```
Also update `HasPermissionDirective` to accept `AppPermission | AppPermission[]` instead of `string | string[]`.

---

### 2.5 Mixed Injection Styles (LOW)
**Files:** `auth.service.ts` uses constructor injection; most others use `inject()`.

Stick to one pattern throughout for consistency. The modern Angular preference is `inject()`.

---

### 2.6 `ConfirmService` / `ModalService` Use Unsafe `any` Casts (MEDIUM)
**Files:** `confirm.service.ts`, `modal.service.ts`

```typescript
(componentRef.instance as any).success.subscribe(...)
(componentRef.hostView as any).rootNodes[0]
```

These `any` casts bypass TypeScript and can cause runtime errors if the component interface changes. Consider using Angular's `Dialog` CDK or a typed modal contract interface.

---

### 2.7 Missing `OnDestroy` / Subscription Cleanup (MEDIUM)
**Files:** `employee-form.component.ts`

`this.route.paramMap.subscribe(...)` and `nipControl?.valueChanges.subscribe(...)` are never unsubscribed. This causes memory leaks if the component is re-created.

**Fix:** Use Angular's `takeUntilDestroyed()` operator (Angular 16+):

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

this.route.paramMap
  .pipe(takeUntilDestroyed())
  .subscribe(params => { ... });
```

---

### 2.8 Toast Success Shown Before API Confirms Success (MEDIUM)
**File:** `employees.component.ts` (line 126)

```typescript
if (ok) {
  this.toast.success('Berhasil dihapus'); // ← fires BEFORE the API call
  this.service.remove(id).subscribe({ ... });
}
```

The success toast is displayed before the delete API call completes. If the API fails, the user sees a misleading success message.

**Fix:** Move the toast inside the `next:` callback.

---

### 2.9 Inconsistent Language (UI strings mix Indonesian & English) (LOW)
**Files:** `employees.component.ts`, `employee-form.component.ts`, `roles.component.ts`

Some confirm dialogs and toast messages are in Indonesian, others in English. Standardize on one language, or implement **i18n** using Angular's `@angular/localize`.

---

## 3. Error Handling

### 3.1 Global HTTP Error Handling Missing (HIGH)
**File:** `auth.interceptor.ts`

The interceptor only handles `401`. All other HTTP errors (403, 404, 500, network failures) bubble up to individual components which often silently fail or show generic messages.

**Improvements:**
- Extend the interceptor to handle:
  - **403** → redirect to a "Forbidden" page or show an appropriate notification
  - **5xx** → show a global error toast
  - **Network offline** → show connectivity warning
- Create a dedicated `ErrorHandlerInterceptor` separate from the auth interceptor:

```typescript
// core/interceptors/error-handler.interceptor.ts
catchError((err) => {
  if (err.status === 0) toastService.error('Network error. Check your connection.');
  else if (err.status === 403) router.navigate(['/forbidden']);
  else if (err.status >= 500) toastService.error('Server error. Please try again.');
  return throwError(() => err);
})
```

---

### 3.2 Error Boundary / 404 Route (MEDIUM)
**File:** `app.routes.ts`

The wildcard `**` route currently redirects to `/login` instead of a proper **404 Not Found** page. This is confusing UX.

**Fix:** Create a `NotFoundComponent` and route `**` to it (or only redirect authenticated users who hit unknown paths).

---

### 3.3 `err.statusCode` vs `err.status` Inconsistency (MEDIUM)
**File:** `employee-form.component.ts` (line 126)

```typescript
if (err.statusCode === 409) { // Angular HttpErrorResponse uses `err.status`, not `err.statusCode`
```

Angular's `HttpErrorResponse` exposes `err.status` (number), not `err.statusCode`. This condition will **never be true**, so the conflict error will never be shown.

**Fix:**
```typescript
if (err.status === 409) {
```

---

## 4. Testing

### 4.1 Only a Placeholder Test Exists (HIGH)
**Files:** `app.spec.ts`

The only test file checks for a default `Hello, angular-rbac-starter` heading — a leftover from project scaffolding that will likely fail. There are no unit tests for:
- `AuthService` (login/logout/token handling)
- `AbilityService` (can/cannot logic)
- `authGuard` / `permissionGuard`
- `HasPermissionDirective` rendering behavior
- Any service `fetchAll`, `create`, `update`, `remove`

**Improvements:**
- Write unit tests for all core services and guards using Vitest (already configured).
- Add component tests for the `HasPermissionDirective` with mock `AbilityService`.
- Add integration-style tests for the login flow.

---

### 4.2 No E2E Tests (MEDIUM)
No Playwright or Cypress setup exists. For production readiness, add at minimum:
- Login / logout flow
- Permission-gated route access
- CRUD for at least one resource (e.g., employees)

---

## 5. Performance

### 5.1 No Route-Level Preloading Strategy (MEDIUM)
**File:** `app.config.ts`

Lazy-loaded routes are used (good), but no preloading strategy is configured. After the initial load, subsequent navigation triggers code chunk fetches, causing small delays.

**Fix:**
```typescript
provideRouter(routes, withPreloading(PreloadAllModules))
// or use a custom QuicklinkStrategy for smarter preloading
```

---

### 5.2 No HTTP Caching / Request Deduplication (MEDIUM)
**Files:** All services

If `fetchAll` is called multiple times in quick succession (e.g., on rapid navigation), duplicate HTTP requests are fired. There is no caching or debounce.

**Improvements:**
- Use `shareReplay(1)` for reference data (departments, positions, roles list).
- Add `debounceTime` to search inputs before triggering API calls.

---

### 5.3 Positions Fetched with `limit: 100` Without Pagination in Forms (LOW)
**File:** `employee-form.component.ts` (line 46)

```typescript
this.positionService.fetchAll(1, false, '', 100).subscribe(...)
```

Fetching 100 positions as a workaround for dropdown data is fragile and will break when data grows. Use a dedicated lightweight `getAll()` endpoint or implement virtual scroll / autocomplete.

---

## 6. Build & Configuration

### 6.1 `environment.development.ts` Hardcoded in Source (HIGH)
Already noted in §1.2. Additionally, the production `environment.ts` has `apiUrl: 'http://localhost:5026'` (no `/api/v1` path, and pointing to localhost) — this is clearly not a real production URL.

**Fix:** Set `environment.ts` to a real placeholder or use an environment variable injection strategy.

---

### 6.2 No `withRouterConfig` / Scroll Restoration (LOW)
**File:** `app.config.ts`

On navigation, the scroll position is not restored. Add:
```typescript
provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' }))
```

---

### 6.3 Missing `provideAnimations` / `provideAnimationsAsync` (LOW)
**File:** `app.config.ts`

If any Angular Material or CDK animation is used in the future, animations must be provided. Add proactively:
```typescript
provideAnimationsAsync()
```

---

### 6.4 No `Content Security Policy` Headers (MEDIUM)
No CSP meta tag in `index.html`. This is a basic XSS mitigation for production deployments. Configure CSP on the server/nginx level or add a meta tag.

---

## 7. Developer Experience

### 7.1 No Path Aliases Configured (LOW)
**File:** `tsconfig.json`

Deep relative imports like `../../core/services/auth.service` make refactoring fragile. Configure path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@pages/*": ["src/app/pages/*"],
      "@env/*": ["src/environments/*"]
    }
  }
}
```

---

### 7.2 No Linting Configuration (MEDIUM)

No ESLint config (`eslint.config.js` or `.eslintrc`) is present. Angular projects should use `@angular-eslint` for consistent code style enforcement. Add it via:
```bash
ng add @angular-eslint/schematics
```

---

### 7.3 `vitest` Is Configured But No Tests Beyond Scaffold (LOW)
`vitest` is in `devDependencies` but there are no meaningful tests. The `package.json` `test` script uses `ng test` (Karma/Jasmine), not `vitest`. Align the test runner with what's actually installed.

---

## 8. UX / Accessibility

### 8.1 No Loading Skeleton / Placeholder States (LOW)
Lists show nothing while `loading()` is true. Use skeleton loaders for better perceived performance.

### 8.2 No `aria-` Attributes on Interactive Elements (LOW)
Buttons triggering modals, sidebar nav items, and permission-gated buttons lack `aria-label`, `role`, or `aria-disabled` attributes. This is an accessibility requirement for production apps.

### 8.3 No `403 Forbidden` Page (MEDIUM)
When `permissionGuard` denies access, the user is silently redirected to `/dashboard` with no explanation. A proper "You don't have permission to access this page" message is expected.

---

## Summary Table

| # | Category | Issue | Severity |
|---|----------|-------|----------|
| 1.1 | Security | Token stored in `localStorage` (XSS risk) | 🔴 HIGH |
| 1.2 | Security | Wrong environment file imported | 🔴 HIGH |
| 1.3 | Security | No refresh token / silent refresh | 🔴 HIGH |
| 1.4 | Security | Permissions tamperable via `localStorage` | 🟠 MEDIUM |
| 2.1 | Architecture | Duplicated paginated state in all services | 🔴 HIGH |
| 2.2 | Code Quality | `console.log` in production code | 🟠 MEDIUM |
| 2.3 | Code Quality | `parsePermission` duplicated 3× | 🟠 MEDIUM |
| 2.4 | Code Quality | `AppPermission` type not enforced | 🟠 MEDIUM |
| 2.7 | Code Quality | Missing subscription cleanup (memory leak) | 🟠 MEDIUM |
| 2.8 | Code Quality | Toast shown before API confirms success | 🟠 MEDIUM |
| 3.1 | Error Handling | No global HTTP error handling | 🔴 HIGH |
| 3.2 | Error Handling | No 404 page | 🟠 MEDIUM |
| 3.3 | Error Handling | `err.statusCode` vs `err.status` bug | 🔴 HIGH |
| 4.1 | Testing | No meaningful unit tests | 🔴 HIGH |
| 5.1 | Performance | No preloading strategy | 🟠 MEDIUM |
| 5.2 | Performance | No HTTP caching / debounce on search | 🟠 MEDIUM |
| 6.1 | Config | Production env file has localhost URL | 🔴 HIGH |
| 6.4 | Config | No CSP headers | 🟠 MEDIUM |
| 7.1 | DX | No TypeScript path aliases | 🟡 LOW |
| 7.2 | DX | No ESLint configuration | 🟠 MEDIUM |
| 8.3 | UX | No 403 Forbidden page | 🟠 MEDIUM |
