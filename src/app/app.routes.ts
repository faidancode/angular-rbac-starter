import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },

      {
        path: 'employees',
        canActivate: [permissionGuard('Employee:read')],
        loadComponent: () =>
          import('./pages/employees/employees.component').then((m) => m.EmployeesComponent),
      },
      {
        path: 'departments',
        canActivate: [permissionGuard('Department:read')],
        loadComponent: () =>
          import('./pages/department/department.component').then((m) => m.DepartmentComponent),
      },
      {
        path: 'positions',
        canActivate: [permissionGuard('Position:read')],
        loadComponent: () =>
          import('./pages/positions/positions.component').then((m) => m.PositionComponent),
      },

      {
        path: 'roles',
        canActivate: [permissionGuard('Role:read')],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/roles/roles.component').then((m) => m.RolesComponent),
          },
          {
            path: 'new',
            canActivate: [permissionGuard('Role:create')],
            loadComponent: () =>
              import('./pages/roles/components/role-form/role-form.component').then(
                (m) => m.RoleFormComponent,
              ),
          },
          {
            path: ':id',
            canActivate: [permissionGuard('Role:update')],
            loadComponent: () =>
              import('./pages/roles/components/role-form/role-form.component').then(
                (m) => m.RoleFormComponent,
              ),
          },
        ],
      },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
