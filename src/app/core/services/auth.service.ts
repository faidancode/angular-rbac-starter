import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AbilityService } from './ability.service';

// --- Types ---
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roleName: string;
  avatar?: string;
}

interface LoginApiResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
    permissions: {
      action: string;
      subject: string;
    }[];
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // --- Private Signals ---
  private readonly _token = signal<string | null>(localStorage.getItem('hris_token'));

  private readonly _user = signal<AuthUser | null>(this._loadUser());

  // --- Public Computed ---
  readonly isAuthenticated = computed(() => !!this._token());
  readonly currentUser = computed(() => this._user());

  constructor(
    private http: HttpClient,
    private router: Router,
    private abilityService: AbilityService,
  ) {}

  // --- Login ---
  login(email: string, password: string): Observable<void> {
    return this.http
      .post<LoginApiResponse>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          const data = res.data;

          // --- persist ---
          localStorage.setItem('hris_token', data.accessToken);
          localStorage.setItem('hris_user', JSON.stringify(data.user));

          // --- update state ---
          this._token.set(data.accessToken);
          this._user.set(data.user);

          // --- set permissions (🔥 no decode JWT) ---
          this.abilityService.setPermissions(
            (data.permissions ?? []).map((p) => ({
              action: p.action,
              subject: p.subject,
            })),
          );
        }),
        tap(() => {
          this.router.navigate(['/dashboard']);
        }),
        map(() => void 0),
      );
  }

  // --- Logout ---
  logout(): void {
    ['hris_token', 'hris_user'].forEach((k) => localStorage.removeItem(k));

    this._token.set(null);
    this._user.set(null);

    // 🔥 clear ability
    this.abilityService.clearPermissions();

    this.router.navigate(['/login']);
  }

  // --- Token accessor ---
  getToken(): string | null {
    return this._token();
  }

  // --- Init helper (optional, for refresh case) ---
  hydrate(): void {
    const user = this._loadUser();
    if (user) {
      this._user.set(user);
    }
  }

  private _loadUser(): AuthUser | null {
    try {
      return JSON.parse(localStorage.getItem('hris_user') ?? 'null');
    } catch {
      return null;
    }
  }
}
