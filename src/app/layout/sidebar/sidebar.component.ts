import {
  Component,
  EventEmitter,
  Output,
  inject,
  input,
  computed,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideCpu, LucideLayoutDashboard, LucideUsers, LucideKey, LucideChevronLeft, LucideChevronRight, LucideBuilding, LucideDynamicIcon } from '@lucide/angular';

import { AbilityService } from '../../core/services/ability.service';
import { NavItem } from './sidebar.types';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideDynamicIcon,
    LucideCpu,
    LucideLayoutDashboard,
    LucideUsers,
    LucideKey,
    LucideChevronLeft,
    LucideChevronRight,
    LucideBuilding
  ],
  template: `
    <aside [class.collapsed]="collapsed()" class="sidebar-container">
      <div class="sidebar-header">
        <div class="logo-box">
          <div class="icon-square">
            <svg lucideCpu [size]="16" color="white"></svg>
          </div>
          @if (!collapsed()) {
            <span class="brand-text">HRIS_TERMINAL</span>
          }
        </div>
      </div>

      <nav class="sidebar-nav custom-scrollbar">
        <div class="nav-section">
          @if (!collapsed()) {
            <p class="section-label">Core Systems</p>
          }

          <div class="nav-list">
            @for (item of visibleNavItems(); track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="active-link"
                class="nav-item group"
              >
                <div class="active-indicator"></div>

                <div class="nav-icon">
                  <svg [lucideIcon]="item.icon" [size]="20"></svg>
                </div>

                @if (!collapsed()) {
                  <span class="nav-label">{{ item.label }}</span>
                }

                @if (collapsed()) {
                  <div class="nav-tooltip">
                    {{ item.label }}
                  </div>
                }
              </a>
            }
          </div>
        </div>
      </nav>

      <div class="sidebar-footer">
        @if (!collapsed()) {
          <span class="status-text">SYSTEM_ONLINE</span>
        } @else {
          <div class="status-pulse"></div>
        }
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.scss'] // Atau masukkan ke blok styles di bawah
})
export class SidebarComponent {
  // --- state ---
  collapsed = input<boolean>(false);
  @Output() toggleCollapse = new EventEmitter<void>();

  private ability = inject(AbilityService);

  // --- icons (exposed to template) ---
  protected readonly LucideCpu = LucideCpu;
  protected readonly LucideChevronLeft = LucideChevronLeft;
  protected readonly LucideChevronRight = LucideChevronRight;

  // --- nav config ---
  private readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: LucideLayoutDashboard },
    {
      label: 'Employees',
      route: '/employees',
      icon: LucideUsers,
      permission: 'Employee:read',
    },
    {
      label: 'Departments',
      route: '/departments',
      icon: LucideBuilding,
      permission: 'Department:read',
    },
    {
      label: 'Access Control',
      route: '/roles',
      icon: LucideKey,
      permission: 'Role:read',
    },
  ];

  // --- computed (IMPORTANT: no function in template) ---
  protected readonly visibleNavItems = computed(() => {
    if (!this.ability.permissionsLoaded()) return [];

    return this.navItems.filter((item) => {
      if (!item.permission) return true;

      const { action, subject } = this.parsePermission(item.permission);
      return this.ability.can(action, subject);
    });
  });

  // --- helper ---
  private parsePermission(value: string) {
    const [subject, action] = value.includes('.')
      ? value.split('.')
      : value.split(':');

    return { action, subject };
  }
}