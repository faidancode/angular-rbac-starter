import { Component } from '@angular/core';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [HasPermissionDirective],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-white">Role Management</h2>
          <p class="text-slate-400 text-sm mt-1">Manage RBAC roles and their permissions</p>
        </div>
        <button
          *hasPermission="'write:role'"
          class="bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl
                 transition-all hover:-translate-y-0.5 shadow-lg shadow-primary-600/30"
        >
          + Create Role
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        @for (role of roles; track role.id) {
          <div class="glass-card p-5 hover:-translate-y-1 transition-transform duration-200">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="font-semibold text-white">{{ role.name }}</h3>
                <p class="text-xs text-slate-400 mt-0.5">{{ role.description }}</p>
              </div>
              <span
                class="text-xs bg-primary-600/20 text-primary-400 px-2.5 py-1 rounded-full font-medium"
              >
                {{ role.userCount }} users
              </span>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-4">
              @for (perm of role.permissions; track perm) {
                <span
                  class="text-xs bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 rounded-lg font-mono"
                >
                  {{ perm }}
                </span>
              }
            </div>
            <div class="flex gap-2 mt-4 pt-4 border-t border-white/5">
              <button
                *hasPermission="'write:role'"
                class="flex-1 text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 py-2 rounded-lg transition-colors font-medium"
              >
                Edit Role
              </button>
              <button
                *hasPermission="'delete:role'"
                class="flex-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class RolesComponent {
  roles: Role[] = [
    {
      id: 1,
      name: 'Super Admin',
      description: 'Full system access',
      permissions: [
        'read:employee',
        'write:employee',
        'delete:employee',
        'read:role',
        'write:role',
        'delete:role',
      ],
      userCount: 2,
    },
    {
      id: 2,
      name: 'HR Manager',
      description: 'Manage employees and leaves',
      permissions: ['read:employee', 'write:employee', 'read:role'],
      userCount: 8,
    },
    {
      id: 3,
      name: 'Viewer',
      description: 'Read-only access',
      permissions: ['read:employee'],
      userCount: 45,
    },
  ];
}
