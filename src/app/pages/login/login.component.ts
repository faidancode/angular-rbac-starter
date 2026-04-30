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
    <div class="login-container">
      <div class="login-sidebar">
        <div class="grid-bg">
          <svg lucideLayoutGrid [size]="640" color="white"></svg>
        </div>

        <div class="logo-wrapper">
          <div class="logo-box">
            <svg lucideZap color="white" [size]="24"></svg>
          </div>
        </div>

        <div class="sidebar-content">
          <h2>Managing people, <br /><span>with intentionality.</span></h2>
          <p>A premium workspace designed for the modern HR professional. Streamlined, secure, and human-centric.</p>
        </div>

        <div class="sidebar-footer">© 2026 HRISCore Systems v2.1.0</div>
      </div>

      <div class="login-main">
        <div class="login-card">
          <div class="mobile-logo">
            <div class="logo-box">
              <svg lucideZap color="white" [size]="20"></svg>
            </div>
          </div>

          <header>
            <h1>Sign In</h1>
            <p>Enter your credentials to access the platform.</p>
          </header>

          @if (error()) {
            <div class="error-alert">
              <svg lucideCircleAlert color="#ef4444" [size]="20"></svg>
              <p>{{ error() }}</p>
            </div>
          }

          <form (submit)="onLogin(); $event.preventDefault()">
            <div class="form-group">
              <label>Email Address</label>
              <div class="input-wrapper">
                <div class="input-icon">
                  <svg lucideMail [size]="20"></svg>
                </div>
                <input
                  [(ngModel)]="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div class="form-group">
              <div class="label-row">
                <label>Password</label>
                <a href="#" class="forgot-link">Forgot Password?</a>
              </div>
              <div class="input-wrapper">
                <div class="input-icon">
                  <svg lucideLock [size]="20"></svg>
                </div>
                <input
                  [(ngModel)]="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" class="submit-btn" [disabled]="loading()">
              @if (loading()) {
                <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                <span>Processing...</span>
              } @else {
                <span>Enter Workspace</span>
                <svg lucideArrowRight [size]="20"></svg>
              }
            </button>
          </form>

          <footer>
          </footer>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
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
