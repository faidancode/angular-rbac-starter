import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideSearch, LucideMenu } from '@lucide/angular';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, LucideSearch, LucideMenu],
  template: `
    <div class="shell-container">
      <app-sidebar
        [collapsed]="isCollapsed()"
        (toggleCollapse)="isCollapsed.set(!isCollapsed())"
      />

      <main class="shell-main">
        <header>
          <div class="header-left">
            <button (click)="isCollapsed.set(!isCollapsed())" class="menu-toggle">
              <svg lucideMenu [size]="20"></svg>
            </button>

            <div class="workspace-info">
              <span class="workspace-label">Current Workspace</span>
              <h1>
                <span class="pulse-dot"></span>
                CORE_SYSTEM / {{ user()?.roleName ?? 'GUEST' }}
              </h1>
            </div>
          </div>

          <div class="header-right">
            <div class="user-profile">
              <div class="user-info">
                <span class="user-name">{{ user()?.name ?? 'Anonymous' }}</span>
                <span class="user-role">{{ user()?.roleName ?? 'Unauthorized' }}</span>
              </div>

              <div class="user-avatar">
                <span>{{ initials() }}</span>
              </div>
            </div>
          </div>
        </header>

        <section class="content-section custom-scrollbar">
          <div class="grid-pattern"></div>
          <div class="content-wrapper">
            <router-outlet />
          </div>
        </section>
      </main>
    </div>
  `,
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  auth = inject(AuthService);
  isCollapsed = signal(false);
  user = this.auth.currentUser;
  initials = computed(
    () =>
      this.user()
        ?.name?.split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ?? 'HR',
  );

  protected readonly LucideSearch = LucideSearch;
  protected readonly LucideMenu = LucideMenu;
}
