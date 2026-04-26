import { Component } from '@angular/core';

interface StatCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-white">Dashboard Overview</h2>
        <p class="text-slate-400 text-sm mt-1">Welcome back — here's what's happening today.</p>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        @for (card of stats; track card.label) {
          <div
            class="glass-card p-5 flex items-start gap-4 hover:-translate-y-1 transition-transform duration-200"
          >
            <div
              [class]="
                'w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ' +
                card.color
              "
            >
              {{ card.icon }}
            </div>
            <div class="min-w-0">
              <p class="text-slate-400 text-xs font-medium uppercase tracking-wider truncate">
                {{ card.label }}
              </p>
              <p class="text-2xl font-bold text-white mt-0.5">{{ card.value }}</p>
              <p [class]="'text-xs mt-1 ' + (card.positive ? 'text-emerald-400' : 'text-red-400')">
                {{ card.change }}
              </p>
            </div>
          </div>
        }
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Department Distribution -->
        <div class="glass-card p-6">
          <h3 class="font-semibold text-white mb-4">Department Distribution</h3>
          <div class="space-y-3">
            @for (dept of departments; track dept.name) {
              <div>
                <div class="flex justify-between text-sm mb-1.5">
                  <span class="text-slate-300">{{ dept.name }}</span>
                  <span class="text-slate-400 font-medium">{{ dept.count }} · {{ dept.pct }}%</span>
                </div>
                <div class="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    [class]="dept.color"
                    [style.width]="dept.pct + '%'"
                  ></div>
                </div>
              </div>
            }
          </div>
          <p class="text-xs text-slate-500 mt-4 italic">
            💡 Connect ApexCharts or Chart.js for interactive charts
          </p>
        </div>

        <!-- Recent Activity -->
        <div class="glass-card p-6">
          <h3 class="font-semibold text-white mb-4">Recent Activity</h3>
          <div class="space-y-3">
            @for (activity of activities; track activity.id) {
              <div class="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                <div
                  class="w-8 h-8 rounded-full bg-primary-600/30 flex items-center justify-center text-sm shrink-0"
                >
                  {{ activity.icon }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm text-white font-medium truncate">{{ activity.title }}</p>
                  <p class="text-xs text-slate-500">{{ activity.time }}</p>
                </div>
                <span
                  [class]="
                    'ml-auto text-xs px-2 py-0.5 rounded-full shrink-0 ' + activity.badgeClass
                  "
                >
                  {{ activity.badge }}
                </span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  stats: StatCard[] = [
    {
      label: 'Total Employees',
      value: '1,284',
      change: '+12 this month',
      positive: true,
      icon: '👥',
      color: 'bg-primary-600/20 text-primary-400',
    },
    {
      label: 'Active Status',
      value: '1,201',
      change: '93.5% active',
      positive: true,
      icon: '✅',
      color: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      label: 'New Hires',
      value: '47',
      change: '+8 vs last month',
      positive: true,
      icon: '🆕',
      color: 'bg-sky-500/20 text-sky-400',
    },
    {
      label: 'On Leave',
      value: '83',
      change: '6.5% workforce',
      positive: false,
      icon: '🏖️',
      color: 'bg-amber-500/20 text-amber-400',
    },
  ];

  departments = [
    { name: 'Engineering', count: 312, pct: 24, color: 'bg-primary-500' },
    { name: 'Sales', count: 256, pct: 20, color: 'bg-emerald-500' },
    { name: 'Operations', count: 198, pct: 15, color: 'bg-sky-500' },
    { name: 'HR & Finance', count: 154, pct: 12, color: 'bg-violet-500' },
    { name: 'Marketing', count: 128, pct: 10, color: 'bg-amber-500' },
  ];

  activities = [
    {
      id: 1,
      icon: '👤',
      title: 'John Doe joined Engineering',
      time: '2 mins ago',
      badge: 'New Hire',
      badgeClass: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      id: 2,
      icon: '✏️',
      title: 'Sarah K. profile updated',
      time: '1 hr ago',
      badge: 'Updated',
      badgeClass: 'bg-sky-500/20 text-sky-400',
    },
    {
      id: 3,
      icon: '🔐',
      title: 'Role "Manager" permissions changed',
      time: '3 hrs ago',
      badge: 'RBAC',
      badgeClass: 'bg-amber-500/20 text-amber-400',
    },
    {
      id: 4,
      icon: '🏖️',
      title: 'Michael T. leave approved',
      time: '5 hrs ago',
      badge: 'Leave',
      badgeClass: 'bg-violet-500/20 text-violet-400',
    },
  ];
}
