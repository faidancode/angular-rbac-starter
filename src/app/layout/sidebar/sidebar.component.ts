import { Component, EventEmitter, Output, inject, input, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideCpu,
  LucideLayoutDashboard,
  LucideUsers,
  LucideKey,
  LucideChevronLeft,
  LucideChevronRight,
  LucideBuilding,
  LucideDynamicIcon,
  LucideUserStar,
} from '@lucide/angular';

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
    LucideBuilding,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'], // Atau masukkan ke blok styles di bawah
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
      label: 'Positions',
      route: '/positions',
      icon: LucideUserStar,
      permission: 'Position:read',
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
    const [subject, action] = value.includes('.') ? value.split('.') : value.split(':');

    return { action, subject };
  }
}
