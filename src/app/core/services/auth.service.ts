import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // --- Private Signals ---
  private readonly _token = signal<string | null>(localStorage.getItem('hris_token'));
  private readonly _user = signal<AuthUser | null>(this._loadUser());
  private readonly _perms = signal<string[]>(this._loadPerms());

  // --- Public Computed ---
  readonly isAuthenticated = computed(() => !!this._token());
  readonly currentUser = computed(() => this._user());
  readonly permissions = computed(() => this._perms());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          const decoded = this._decodeJwt(res.token);
          const perms: string[] = decoded?.permissions ?? [];

          localStorage.setItem('hris_token', res.token);
          localStorage.setItem('hris_user', JSON.stringify(res.user));
          localStorage.setItem('hris_perms', JSON.stringify(perms));

          this._token.set(res.token);
          this._user.set(res.user);
          this._perms.set(perms);
        }),
      );
  }

  logout() {
    ['hris_token', 'hris_user', 'hris_perms'].forEach((k) => localStorage.removeItem(k));
    this._token.set(null);
    this._user.set(null);
    this._perms.set([]);
    this.router.navigate(['/login']);
  }

  hasPermission(permission: string): boolean {
    return this._perms().includes(permission);
  }

  getToken(): string | null {
    return this._token();
  }

  private _decodeJwt(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  private _loadUser(): AuthUser | null {
    try {
      return JSON.parse(localStorage.getItem('hris_user') ?? 'null');
    } catch {
      return null;
    }
  }

  private _loadPerms(): string[] {
    try {
      return JSON.parse(localStorage.getItem('hris_perms') ?? '[]');
    } catch {
      return [];
    }
  }
}
