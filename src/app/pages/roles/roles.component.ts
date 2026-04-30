import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { RoleService } from '../../core/services/role.service';
import { ConfirmService } from '../../core/services/confirm.service';
import { ToastService } from '../../shared/services/toast.service';
import { RoleDto } from '../../core/types/role.types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective],
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
          (click)="openCreate()"
        >
          <span>+ Create Role</span>
        </button>
      </div>

      <div class="roles-grid" *ngIf="!isLoading()">
        @for (role of roles(); track role.id) {
          <div class="role-card">
            <div class="card-header">
              <div class="role-info">
                <h3>{{ role.name }}</h3>
                <p class="role-desc">{{ role.description }}</p>
              </div>
              <span class="user-count-badge">
                {{ role.permissions?.length ?? 0 }} perms
              </span>
            </div>
            
            <div class="permissions-list">
              @for (perm of role.permissions ?? []; track perm.id) {
                <span class="permission-tag" *ngIf="$index < 8">
                  {{ perm.subject }}:{{ perm.action }}
                </span>
              }
              <span class="permission-tag more-tag" *ngIf="(role.permissions?.length ?? 0) > 8">
                +{{ (role.permissions?.length ?? 0) - 8 }} more
              </span>
            </div>

            <div class="card-footer">
                <button
                  *hasPermission="'Role:update'"
                  class="btn-action edit"
                  (click)="openEdit(role.id)"
                >
                  Edit Role
                </button>
              <button
                *hasPermission="'Role:delete'"
                class="btn-action delete"
                (click)="deleteRole(role.id)"
              >
                Delete
              </button>
            </div>
          </div>
        }
        
        <div class="empty-state" *ngIf="roles().length === 0">
           <p>No roles found.</p>
        </div>
      </div>
      
      <div class="loading-state" *ngIf="isLoading()">
         <p>Loading roles...</p>
      </div>
    </div>
  `,
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  private roleService = inject(RoleService);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);

  readonly roles = signal<RoleDto[]>([]);
  readonly isLoading = signal(true);

  ngOnInit() {
    this.fetchRoles();
  }

  fetchRoles() {
    this.isLoading.set(true);
    this.roleService
      .getAll({ limit: 100 })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          const data = res?.data ?? res;

          if (Array.isArray(data)) {
            this.roles.set(data);
          } else if (data && Array.isArray(data.items)) {
            this.roles.set(data.items);
          } else {
            this.roles.set([]);
          }
        },
        error: () => {
          this.toastService.error('Failed to load roles');
          this.roles.set([]);
        },
      });
  }

  openCreate() {
    this.router.navigate(['/roles/new']);
  }

  openEdit(id: string) {
    this.router.navigate(['/roles', id]);
  }

  async deleteRole(id: string) {
    const ok = await this.confirmService.open({
      title: 'Delete Role',
      message: 'Are you sure you want to delete this role?',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (ok) {
      this.roleService.remove(id).subscribe({
        next: () => {
          this.toastService.success('Role deleted successfully');
          this.fetchRoles();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to delete role');
        }
      });
    }
  }
}
