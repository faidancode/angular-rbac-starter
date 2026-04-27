import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AbilityService } from '../services/ability.service';

function parsePermission(value: string): { action: string; subject: string } {
  const separator = value.includes('.') ? '.' : ':';
  const [subject, action] = value.split(separator);
  return { action, subject };
}

// --- Auth Guard ---
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

// --- Permission Guard ---
export const permissionGuard =
  (permission: string): CanActivateFn =>
  () => {
    const ability = inject(AbilityService);
    const router = inject(Router);

    // 🔥 kalau permissions belum ada → anggap belum login / reload
    if (!ability.permissionsLoaded()) {
      return router.createUrlTree(['/login']);
    }

    const { action, subject } = parsePermission(permission);

    return ability.can(action, subject) ? true : router.createUrlTree(['/dashboard']);
  };
