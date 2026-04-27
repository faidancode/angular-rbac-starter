import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  LucideCalendarCheck,
  LucideCircleCheck,
  LucideDownload,
  LucideDynamicIcon,
  LucidePencil,
  LucidePlane,
  LucidePlus,
  LucideShieldCheck,
  LucideUserPlus,
  LucideUsers,
} from '@lucide/angular';

interface StatCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: any;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LucideDynamicIcon,
    LucideDownload,
    LucidePlus,
  ],
  template: `
    <div class="space-y-10 animate-in fade-in duration-700">
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="text-3xl font-bold text-primary tracking-tight">Dashboard Overview</h2>
          <p class="text-text-muted font-medium mt-1">
            Real-time insights across your global workforce.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button class="secondary-button">
            <svg lucideDownload [size]="18"></svg>
            <span>Export Report</span>
          </button>
          <button class="primary-button">
            <svg lucidePlus [size]="18"></svg>
            <span>Add Employee</span>
          </button>
        </div>
      </header>

      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        @for (card of stats; track card.label) {
          <div
            class="bg-white p-6 rounded-2xl border border-subtle shadow-sm hover:shadow-md transition-all group"
          >
            <div class="flex justify-between items-start mb-4">
              <div
                [class]="
                  'w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ' +
                  card.color
                "
              >
                <svg [lucideIcon]="card.icon" [size]="24"></svg>
              </div>
              <span
                [class]="
                  'text-xs font-bold px-2.5 py-1 rounded-lg ' +
                  (card.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')
                "
              >
                {{ card.change }}
              </span>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                {{ card.label }}
              </p>
              <p class="text-3xl font-bold text-primary mt-1 tracking-tight">{{ card.value }}</p>
            </div>
          </div>
        }
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-7 bg-white rounded-2xl border border-subtle p-8">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-lg font-bold text-primary tracking-tight">Workforce Distribution</h3>
            <button
              class="text-xs font-bold text-secondary uppercase tracking-widest hover:underline"
            >
              View Analytics
            </button>
          </div>

          <div class="space-y-6">
            @for (dept of departments; track dept.name) {
              <div class="group">
                <div class="flex justify-between items-end text-sm mb-2">
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-text-muted uppercase tracking-tighter"
                      >{{ dept.count }} Employees</span
                    >
                    <span class="font-bold text-primary">{{ dept.name }}</span>
                  </div>
                  <span class="text-sm font-black text-primary">{{ dept.pct }}%</span>
                </div>
                <div class="h-1.5 bg-surface-50 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-1000 ease-out"
                    [class]="dept.color"
                    [style.width]="dept.pct + '%'"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="lg:col-span-5 bg-white rounded-2xl border border-subtle p-8 flex flex-col">
          <h3 class="text-lg font-bold text-primary tracking-tight mb-8">System Activity</h3>

          <div class="space-y-8 flex-1">
            @for (activity of activities; track activity.id) {
              <div class="flex gap-4 relative group">
                @if (!$last) {
                  <div class="absolute left-5 top-10 bottom-[-20px] w-px bg-subtle"></div>
                }

                <div
                  class="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center shrink-0 z-10 border border-subtle group-hover:border-primary transition-colors"
                >
                  <svg [lucideIcon]="activity.icon" [size]="18" class="text-primary"></svg>
                </div>

                <div class="flex-1 pt-1">
                  <div class="flex justify-between items-start">
                    <p class="text-sm font-bold text-primary leading-tight">{{ activity.title }}</p>
                    <span class="text-[10px] font-bold text-text-muted uppercase shrink-0 ml-2">{{
                      activity.time
                    }}</span>
                  </div>
                  <div class="mt-2">
                    <span
                      [class]="
                        'text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ' +
                        activity.badgeClass
                      "
                    >
                      {{ activity.badge }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>

          <button
            class="w-full mt-8 py-3 rounded-xl border border-subtle text-xs font-bold text-text-muted hover:bg-surface-50 transition-all uppercase tracking-widest"
          >
            Load Full Audit Log
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @reference "../../../styles.css";

      .primary-button {
        @apply bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 
             hover:bg-primary-light transition-all shadow-lg shadow-primary/10 active:scale-95;
      }
      .secondary-button {
        @apply bg-white text-primary border border-subtle px-5 py-2.5 rounded-xl text-sm font-bold 
             flex items-center gap-2 hover:bg-surface-50 transition-all active:scale-95;
      }
    `,
  ],
})
export class DashboardComponent {
  stats = [
    {
      label: 'Total Employees',
      value: '1,284',
      change: '+12%',
      positive: true,
      icon: LucideUsers,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Active Status',
      value: '1,201',
      change: '93.5%',
      positive: true,
      icon: LucideCircleCheck,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'New Hires',
      value: '47',
      change: '+8%',
      positive: true,
      icon: LucideUserPlus,
      color: 'bg-sky-50 text-sky-600',
    },
    {
      label: 'On Leave',
      value: '83',
      change: '-2%',
      positive: false,
      icon: LucidePlane,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  departments = [
    { name: 'Engineering', count: 312, pct: 24, color: 'bg-primary' },
    { name: 'Sales', count: 256, pct: 20, color: 'bg-secondary' },
    { name: 'Operations', count: 198, pct: 15, color: 'bg-indigo-400' },
    { name: 'HR & Finance', count: 154, pct: 12, color: 'bg-emerald-400' },
    { name: 'Marketing', count: 128, pct: 10, color: 'bg-amber-400' },
  ];

  activities = [
    {
      id: 1,
      icon: LucideUserPlus,
      title: 'John Doe joined Engineering',
      time: '2m ago',
      badge: 'New Hire',
      badgeClass: 'border-emerald-100 text-emerald-600 bg-emerald-50',
    },
    {
      id: 2,
      icon: LucidePencil,
      title: 'Sarah K. profile updated',
      time: '1h ago',
      badge: 'Updated',
      badgeClass: 'border-sky-100 text-sky-600 bg-sky-50',
    },
    {
      id: 3,
      icon: LucideShieldCheck,
      title: 'Role "Manager" permissions changed',
      time: '3h ago',
      badge: 'RBAC',
      badgeClass: 'border-amber-100 text-amber-600 bg-amber-50',
    },
    {
      id: 4,
      icon: LucideCalendarCheck,
      title: 'Michael T. leave approved',
      time: '5h ago',
      badge: 'Leave',
      badgeClass: 'border-indigo-100 text-indigo-600 bg-indigo-50',
    },
  ];

  protected readonly LucideCalendarCheck = LucideCalendarCheck;
  protected readonly LucideCircleCheck = LucideCircleCheck;
  protected readonly LucideDownload = LucideDownload;
  protected readonly LucidePlane = LucidePlane;
  protected readonly LucidePencil = LucidePencil;
  protected readonly LucidePlus = LucidePlus;
  protected readonly LucideShieldCheck = LucideShieldCheck;
  protected readonly LucideUserPlus = LucideUserPlus;
  protected readonly LucideUsers = LucideUsers;
}
