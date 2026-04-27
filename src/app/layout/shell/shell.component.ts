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
    <div
      class="flex h-screen bg-white text-[#0f172a] font-['Plus_Jakarta_Sans'] selection:bg-[#0f172a]/10"
    >
      <app-sidebar
        class="bg-[#0f172a] text-white"
        [collapsed]="isCollapsed()"
        (toggleCollapse)="isCollapsed.set(!isCollapsed())"
      />

      <main class="flex-1 flex flex-col relative overflow-hidden">
        <header
          class="h-20 flex items-center justify-between px-10 border-b border-slate-200 bg-white/80 backdrop-blur-xl z-30 sticky top-0"
        >
          <div class="flex items-center gap-6">
            <button
              (click)="isCollapsed.set(!isCollapsed())"
              class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#0f172a] hover:bg-slate-50 transition-all rounded-full group"
            >
              <svg lucideMenu [size]="20" class="group-hover:scale-110 transition-transform"></svg>
            </button>

            <div class="flex flex-col">
              <span class="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold"
                >Current Workspace</span
              >
              <h1 class="text-sm font-black tracking-tight text-[#0f172a] flex items-center gap-2">
                <span class="w-2 h-2 bg-[#e84e1b] animate-pulse"></span>
                CORE_SYSTEM / {{ user()?.roleName ?? 'GUEST' }}
              </h1>
            </div>
          </div>

          <div class="flex items-center gap-6">

            <div class="flex items-center gap-4 border-l border-slate-100 pl-6">
              <div class="flex flex-col text-right hidden sm:flex">
                <span class="text-sm font-black text-[#0f172a] leading-tight tracking-tight">{{
                  user()?.name ?? 'Anonymous'
                }}</span>
                <span class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{{
                  user()?.roleName ?? 'Unauthorized'
                }}</span>
              </div>

              <div
                class="w-10 h-10 bg-[#0f172a] flex items-center justify-center rounded-none shadow-[4px_4px_0px_#e84e1b] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#e84e1b] transition-all cursor-pointer group"
              >
                <span class="text-xs font-black text-white group-hover:scale-110 transition-transform">
                  {{ initials() }}
                </span>
              </div>
            </div>
          </div>
        </header>

        <section class="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
          <div
            class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"
          ></div>

          <div class="p-12 max-w-[1400px] mx-auto relative">
            <router-outlet />
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [
    `
      @reference "../../../styles.css";

      :host {
        --primary: #0f172a;
        --secondary: #e84e1b;
      }

      /* Minimalist Scrollbar */
      .custom-scrollbar::-webkit-scrollbar {
        width: 5px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 0px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `,
  ],
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
