import {
  Component,
  EventEmitter,
  Output,
  inject,
  input,
  computed,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideDynamicIcon, LucideCpu, LucideLayoutDashboard, LucideUsers, LucideKey, LucideChevronLeft, LucideChevronRight } from '@lucide/angular';

import { AbilityService } from '../../core/services/ability.service';
import { NavItem } from './sidebar.types';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideDynamicIcon, LucideCpu, LucideLayoutDashboard, LucideUsers, LucideKey, LucideChevronLeft, LucideChevronRight],
  template: `
    <aside
      [class]="collapsed() ? 'w-20' : 'w-72'"
      class="flex flex-col h-full bg-[#0f172a] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) shrink-0 relative z-40 border-r border-white/5"
    >
      <!-- HEADER -->
      <div class="h-20 flex items-center px-8 border-b border-white/5 mb-8">
        <div class="flex items-center gap-4 overflow-hidden">
          <div class="w-8 h-8 bg-[#e84e1b] flex items-center justify-center">
            <svg lucideCpu [size]="16" color="white"></svg>
          </div>

          @if (!collapsed()) {
            <span class="font-black text-white tracking-[0.2em] text-xs uppercase italic">
              HRIS_TERMINAL
            </span>
          }
        </div>
      </div>

      <!-- NAV -->
      <nav class="flex-1 px-4 space-y-10 overflow-y-auto custom-scrollbar">
        <div>
          @if (!collapsed()) {
            <p class="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">
              Core Systems
            </p>
          }

          <div class="space-y-2">
            @for (item of visibleNavItems(); track item.route) {
              <a
                [routerLink]="item.route"
                routerLinkActive="active-link"
                class="flex items-center gap-4 px-4 py-3 group transition-all duration-300 hover:bg-white/5 relative"
              >
                <div class="active-dot absolute left-0 w-1 h-0 bg-[#e84e1b] transition-all duration-300 opacity-0"></div>

                <div class="text-xl text-slate-500 group-hover:text-white flex items-center">
                  <svg [lucideIcon]="item.icon" [size]="20"></svg>
                </div>

                @if (!collapsed()) {
                  <span class="text-sm font-bold text-slate-400 group-hover:text-white truncate">
                    {{ item.label }}
                  </span>
                }

                @if (collapsed()) {
                  <div class="absolute left-16 bg-white px-3 py-2 text-[10px] text-[#0f172a] opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 font-black uppercase tracking-widest z-50 shadow-2xl">
                    {{ item.label }}
                  </div>
                }
              </a>
            }
          </div>
        </div>
      </nav>

      <!-- FOOTER -->
      <div class="p-6 border-t border-white/5 bg-[#0a0f1d]">
        <button
          (click)="toggleCollapse.emit()"
          class="w-full flex items-center justify-center gap-3 py-3 text-slate-500 hover:text-white hover:bg-white/5 transition-all"
        >
          <svg
            [lucideIcon]="collapsed() ? LucideChevronRight : LucideChevronLeft"
            [size]="20"
          ></svg>

          @if (!collapsed()) {
            <span class="text-[10px] font-black uppercase tracking-[0.3em]">
              Minimize
            </span>
          }
        </button>
      </div>
    </aside>
  `,
  styles: [
    `
      :host {
        --primary: #0f172a;
        --secondary: #e84e1b;
      }

      .active-link {
        background: rgba(255, 255, 255, 0.05);
      }

      .active-link .active-dot {
        height: 70%;
        opacity: 1;
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 3px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
      }
    `,
  ],
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