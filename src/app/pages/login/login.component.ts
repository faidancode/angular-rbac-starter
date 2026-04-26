import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div
      class="min-h-screen bg-surface-950 flex items-center justify-center p-4 relative overflow-hidden"
    >
      <!-- Ambient blobs -->
      <div
        class="absolute top-1/4 -left-32 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none"
      ></div>
      <div
        class="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"
      ></div>

      <div class="glass-card w-full max-w-md p-8 relative z-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <div
            class="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/30"
          >
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">Welcome back</h1>
          <p class="text-slate-400 text-sm mt-1">Sign in to your HRIS account</p>
        </div>

        <!-- Error -->
        @if (error()) {
          <div
            class="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            {{ error() }}
          </div>
        }

        <!-- Form -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
            <input
              [(ngModel)]="email"
              type="email"
              placeholder="admin@company.com"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input
              [(ngModel)]="password"
              type="password"
              placeholder="••••••••"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all text-sm"
            />
          </div>

          <button
            (click)="onLogin()"
            [disabled]="loading()"
            class="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed
                   text-white font-semibold py-3 rounded-xl transition-all duration-200
                   shadow-lg shadow-primary-600/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 mt-2"
          >
            @if (loading()) {
              <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Authenticating...
              </span>
            } @else {
              Sign In
            }
          </button>
        </div>

        <p class="text-center text-xs text-slate-500 mt-6">Protected by JWT · RBAC Enabled</p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  private auth = inject(AuthService);
  private router = inject(Router);

  onLogin() {
    if (!this.email || !this.password) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error.set('Invalid credentials. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
