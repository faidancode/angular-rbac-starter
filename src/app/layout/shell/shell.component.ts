import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-surface-950">
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        (toggleCollapse)="sidebarCollapsed.set(!sidebarCollapsed())"
      />

      <main class="flex-1 overflow-y-auto">
        <!-- Top Bar -->
        <header
          class="sticky top-0 z-10 glass border-b border-white/5 px-6 py-4 flex items-center justify-between"
        >
          <h1 class="text-lg font-semibold text-white/90 tracking-tight">HRIS Platform</h1>
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-sm font-semibold ring-2 ring-primary-500/30"
            >
              {{ initials() }}
            </div>
            <div class="hidden sm:block">
              <p class="text-sm font-medium text-white/90">{{ user()?.name }}</p>
              <p class="text-xs text-slate-400">{{ user()?.role }}</p>
            </div>
            <button
              (click)="auth.logout()"
              class="ml-2 text-xs text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/10"
            >
              Logout
            </button>
          </div>
        </header>

        <div class="p-6">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class ShellComponent {
  auth = inject(AuthService);
  sidebarCollapsed = signal(false);
  user = this.auth.currentUser;
  initials = () =>
    this.user()
      ?.name?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2) ?? 'HR';
}
