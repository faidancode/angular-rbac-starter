import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  LucideLayoutGrid,
  LucideZap,
  LucideCircleAlert,
  LucideMail,
  LucideLock,
  LucideArrowRight,
  LucideShieldCheck,

} from '@lucide/angular';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, LucideLayoutGrid, LucideZap, LucideCircleAlert, LucideMail, LucideLock, LucideArrowRight, LucideShieldCheck],
  template: `
    <div class="min-h-screen bg-surface-50 flex flex-col md:flex-row font-sans">
      <div
        class="hidden md:flex md:w-1/2 bg-[#0f172a] relative p-16 flex-col justify-between overflow-hidden"
      >
        <div class="absolute inset-0 opacity-10 pointer-events-none">
          <svg
            lucideLayoutGrid
            [size]="640"
            color="white"
            class="absolute -top-40 -left-40"
          ></svg>
        </div>

        <div class="relative z-10">
          <div
            class="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
          >
            <svg lucideZap color="white" [size]="24"></svg>
          </div>
        </div>

        <div class="relative z-10 max-w-md">
          <h2 class="text-4xl font-bold text-white tracking-tight leading-tight mb-4">
            Managing people, <br />
            <span class="text-[#e84e1b]">with intentionality.</span>
          </h2>
          <p class="text-white/60 text-lg leading-relaxed font-light">
            A premium workspace designed for the modern HR professional. Streamlined, secure, and
            human-centric.
          </p>
        </div>

        <div class="relative z-10 text-white/40 text-xs font-semibold uppercase tracking-widest">
          © 2026 HRISCore Systems v2.1.0
        </div>
      </div>

      <div class="flex-1 flex items-center justify-center p-8 bg-white">
        <div class="w-full max-w-100">
          <div class="md:hidden flex items-center justify-center mb-8">
            <div class="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center">
              <svg lucideZap color="white" [size]="20"></svg>
            </div>
          </div>

          <header class="mb-10">
            <h1 class="text-3xl font-bold text-surface-900 tracking-tight">Sign In</h1>
            <p class="text-surface-500 mt-2 font-medium">
              Enter your credentials to access the platform.
            </p>
          </header>

          @if (error()) {
            <div
              class="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2"
            >
              <svg lucideCircleAlert color="#ef4444" [size]="20"></svg>
              <p class="text-red-700 text-sm font-semibold">{{ error() }}</p>
            </div>
          }

          <form (submit)="onLogin(); $event.preventDefault()" class="space-y-6">
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-surface-400 ml-1"
                >Email Address</label
              >
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 flex items-center">
                  <svg lucideMail [size]="20"></svg>
                </div>
                <input
                  [(ngModel)]="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  class="w-full bg-surface-50 border border-surface-200 rounded-xl pl-12 pr-4 py-3.5 text-surface-900 placeholder-surface-400
                         focus:outline-none focus:ring-2 focus:ring-[#0f172a]/10 focus:border-[#0f172a] transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-end px-1">
                <label class="text-xs font-bold uppercase tracking-wider text-surface-400"
                  >Password</label
                >
                <a
                  href="#"
                  class="text-xs font-bold text-[#0f172a] hover:text-[#e84e1b] transition-colors"
                  >Forgot Password?</a
                >
              </div>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 flex items-center">
                  <svg lucideLock [size]="20"></svg>
                </div>
                <input
                  [(ngModel)]="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  class="w-full bg-surface-50 border border-surface-200 rounded-xl pl-12 pr-4 py-3.5 text-surface-900 placeholder-surface-400
                         focus:outline-none focus:ring-2 focus:ring-[#0f172a]/10 focus:border-[#0f172a] transition-all text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-70 disabled:cursor-not-allowed
                     text-white font-bold py-4 rounded-xl transition-all duration-300
                     shadow-xl shadow-[#0f172a]/20 hover:shadow-[#0f172a]/30 flex items-center justify-center gap-3 mt-4"
            >
              @if (loading()) {
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Processing...</span>
              } @else {
                <span>Enter Workspace</span>
                <svg lucideArrowRight [size]="20"></svg>
              }
            </button>
          </form>

          <footer class="mt-12 pt-8 border-t border-surface-100 flex items-center justify-between">
            <div class="flex items-center gap-2 text-surface-400">
              <svg lucideShieldCheck [size]="18"></svg>
              <span class="text-[10px] font-bold uppercase tracking-widest">Secure SSO</span>
            </div>
            <div class="flex gap-4">
              <span
                class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              ></span>
              <span class="text-[10px] font-bold uppercase tracking-widest text-surface-400"
                >Systems Active</span
              >
            </div>
          </footer>
        </div>
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

  protected readonly LucideLayoutGrid = LucideLayoutGrid;
  protected readonly LucideZap = LucideZap;
  protected readonly LucideCircleAlert = LucideCircleAlert;
  protected readonly LucideMail = LucideMail;
  protected readonly LucideLock = LucideLock;
  protected readonly LucideArrowRight = LucideArrowRight;
  protected readonly LucideShieldCheck = LucideShieldCheck;

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
