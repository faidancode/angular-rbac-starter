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
    <div class="dashboard-container animate-in">
      <header class="dashboard-header">
        <div class="header-content">
          <h2>Dashboard Overview</h2>
          <p>Real-time insights across your global workforce.</p>
        </div>
        <div class="header-actions">
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

      <section class="stats-grid">
        @for (card of stats; track card.label) {
          <div class="stat-card">
            <div class="card-header">
              <div class="icon-box" [class]="card.color">
                <svg [lucideIcon]="card.icon" [size]="24"></svg>
              </div>
              <span class="change-badge" [class.positive]="card.positive" [class.negative]="!card.positive">
                {{ card.change }}
              </span>
            </div>
            <div class="card-body">
              <p class="card-label">{{ card.label }}</p>
              <p class="card-value">{{ card.value }}</p>
            </div>
          </div>
        }
      </section>

      <div class="dashboard-layout">
        <div class="main-chart-area">
          <div class="section-header">
            <h3>Workforce Distribution</h3>
            <a href="#" class="view-link">View Analytics</a>
          </div>

          <div class="distribution-list">
            @for (dept of departments; track dept.name) {
              <div class="distribution-item">
                <div class="item-info">
                  <div class="label-group">
                    <span class="count">{{ dept.count }} Employees</span>
                    <span class="name">{{ dept.name }}</span>
                  </div>
                  <span class="percentage">{{ dept.pct }}%</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    [class]="dept.color"
                    [style.width]="dept.pct + '%'"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="activity-feed">
          <h3>System Activity</h3>

          <div class="feed-container">
            @for (activity of activities; track activity.id) {
              <div class="activity-item">
                @if (!$last) {
                  <div class="line"></div>
                }

                <div class="icon-circle">
                  <svg [lucideIcon]="activity.icon" [size]="18"></svg>
                </div>

                <div class="item-content">
                  <div class="content-header">
                    <p>{{ activity.title }}</p>
                    <span class="time">{{ activity.time }}</span>
                  </div>
                  <div class="badge-row">
                    <span class="activity-badge" [class]="activity.badgeClass">
                      {{ activity.badge }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>

          <button class="load-more-btn">Load Full Audit Log</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
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
