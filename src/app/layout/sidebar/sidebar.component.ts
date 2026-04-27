import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AbilityService } from '../../core/services/ability.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      [class]="collapsed ? 'w-16' : 'w-64'"
      class="flex flex-col h-full glass border-r border-white/5 transition-all duration-300 ease-in-out shrink-0"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div class="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        @if (!collapsed) {
          <span class="font-bold text-white text-base tracking-tight">HRISCore</span>
        }
        <button
          (click)="toggleCollapse.emit()"
          class="ml-auto text-slate-400 hover:text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-3 space-y-1 overflow-hidden">
        @for (item of visibleNavItems(); track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-primary-600/20 text-primary-400 border-primary-500/30"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent
                   text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150 group"
          >
            <span class="text-lg shrink-0" [innerHTML]="item.icon"></span>
            @if (!collapsed) {
              <span class="text-sm font-medium truncate">{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <!-- Footer -->
      @if (!collapsed) {
        <div class="p-4 border-t border-white/5">
          <p class="text-xs text-slate-500 text-center">v2.1.0 · HRIS Platform</p>
        </div>
      }
    </aside>
  `,
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  private ability = inject(AbilityService);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Employees', icon: '👥', route: '/employees', permission: 'employee.read' },
    { label: 'Role Mgmt', icon: '🔐', route: '/roles', permission: 'role.read' },
  ];

  // --- helper ---
  private parsePermission(value: string) {
    const [subject, action] = value.split('.');
    return { action, subject };
  }

  visibleNavItems = () =>
    this.navItems.filter((item) => {
      if (!item.permission) return true;

      if (!this.ability.permissionsLoaded()) return false;

      const { action, subject } = this.parsePermission(item.permission);

      return this.ability.can(action, subject);
    });
}
