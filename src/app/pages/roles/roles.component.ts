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
    <div class="roles-container">
      <div class="roles-header">
        <div class="header-content">
          <h2>Role Management</h2>
          <p>Manage RBAC roles and their permissions</p>
        </div>
        <button
          *hasPermission="'Role:create'"
          class="primary-button"
        >
          <span>+ Create Role</span>
        </button>
      </div>

      <div class="roles-grid">
        @for (role of roles; track role.id) {
          <div class="role-card">
            <div class="card-header">
              <div class="role-info">
                <h3>{{ role.name }}</h3>
                <p class="role-desc">{{ role.description }}</p>
              </div>
              <span class="user-count-badge">
                {{ role.userCount }} users
              </span>
            </div>
            
            <div class="permissions-list">
              @for (perm of role.permissions; track perm) {
                <span class="permission-tag">
                  {{ perm }}
                </span>
              }
            </div>

            <div class="card-footer">
              <button
                *hasPermission="'Role:update'"
                class="btn-action edit"
              >
                Edit Role
              </button>
              <button
                *hasPermission="'Role:delete'"
                class="btn-action delete"
              >
                Delete
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./roles.component.scss']
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
