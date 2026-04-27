import { Component, signal, computed, inject } from '@angular/core';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { CommonModule } from '@angular/common';
import { LucideSearch } from '@lucide/angular';


interface Employee {
  id: number;
  name: string;
  initials: string;
  nip: string;
  department: string;
  position: string;
  status: 'Active' | 'Inactive' | 'On Leave';
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective, LucideSearch],
  template: `
    <div class="employees-container">
      <div class="employees-header">
        <div class="header-content">
          <h2>Employee Directory</h2>
          <p>{{ filtered().length }} of {{ employees.length }} employees</p>
        </div>
        <div class="header-actions">
          <div class="search-field">
            <svg lucideSearch class="search-icon" [size]="18"></svg>
            <input
              (input)="search.set($any($event.target).value)"
              placeholder="Search employees..."
            />
          </div>
          <button
            *hasPermission="'Employee:create'"
            class="primary-button"
          >
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      <div class="hris-table-wrapper">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                @for (col of columns; track col) {
                  <th>{{ col }}</th>
                }
                <th style="width: 150px"></th>
              </tr>
            </thead>
            <tbody>
              @for (emp of filtered(); track emp.id) {
                <tr>
                  <td>
                    <div class="employee-info-cell">
                      <div class="avatar">{{ emp.initials }}</div>
                      <div class="details">
                        <span class="name">{{ emp.name }}</span>
                        <span class="nip">{{ emp.nip }}</span>
                      </div>
                    </div>
                  </td>
                  <td style="color: #64748b">{{ emp.department }}</td>
                  <td style="color: #64748b">{{ emp.position }}</td>
                  <td>
                    <span
                      class="status-badge"
                      [ngClass]="'status-' + emp.status.toLowerCase().replace(' ', '-')"
                    >
                      {{ emp.status }}
                    </span>
                  </td>
                  <td>
                    <div class="action-row">
                      <button
                        *hasPermission="'Employee:update'"
                        class="btn-minimal edit"
                      >
                        Edit
                      </button>
                      <button
                        *hasPermission="'Employee:delete'"
                        class="btn-minimal delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5">
                    <div class="empty-state">No employees found matching your search.</div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent {
  search = signal('');
  columns = ['Employee', 'Department', 'Position', 'Status'];

  employees: Employee[] = [
    {
      id: 1,
      name: 'Ahmad Fauzi',
      initials: 'AF',
      nip: 'NIP-20210001',
      department: 'Engineering',
      position: 'Senior Dev',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Sari Dewi',
      initials: 'SD',
      nip: 'NIP-20210045',
      department: 'HR',
      position: 'HR Manager',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Budi Santoso',
      initials: 'BS',
      nip: 'NIP-20190023',
      department: 'Finance',
      position: 'Accountant',
      status: 'On Leave',
    },
    {
      id: 4,
      name: 'Rina Kusuma',
      initials: 'RK',
      nip: 'NIP-20220078',
      department: 'Marketing',
      position: 'Brand Manager',
      status: 'Active',
    },
    {
      id: 5,
      name: 'Doni Pratama',
      initials: 'DP',
      nip: 'NIP-20180011',
      department: 'Sales',
      position: 'Sales Lead',
      status: 'Inactive',
    },
    {
      id: 6,
      name: 'Maya Anggraini',
      initials: 'MA',
      nip: 'NIP-20230102',
      department: 'Engineering',
      position: 'Junior Dev',
      status: 'Active',
    },
  ];

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return q
      ? this.employees.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          e.position.toLowerCase().includes(q),
      )
      : this.employees;
  });

  statusClass(status: string): string {
    return (
      {
        Active: 'bg-emerald-500/15 text-emerald-400',
        Inactive: 'bg-slate-500/15 text-slate-400',
        'On Leave': 'bg-amber-500/15 text-amber-400',
      }[status] ?? ''
    );
  }
}
