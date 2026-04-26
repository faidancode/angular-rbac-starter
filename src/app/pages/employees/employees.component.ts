import { Component, signal, computed, inject } from '@angular/core';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';

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
  imports: [HasPermissionDirective],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-white">Employee Directory</h2>
          <p class="text-slate-400 text-sm mt-1">
            {{ filtered().length }} of {{ employees.length }} employees
          </p>
        </div>
        <div class="flex items-center gap-3">
          <input
            (input)="search.set($any($event.target).value)"
            placeholder="Search employees..."
            class="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500
                   focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-64 transition-all"
          />
          <button
            *hasPermission="'write:employee'"
            class="bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl
                   transition-all hover:-translate-y-0.5 shadow-lg shadow-primary-600/30 whitespace-nowrap"
          >
            + Add Employee
          </button>
        </div>
      </div>

      <div class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-white/5">
                @for (col of columns; track col) {
                  <th
                    class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-4"
                  >
                    {{ col }}
                  </th>
                }
                <th class="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              @for (emp of filtered(); track emp.id) {
                <tr class="border-b border-white/5 hover:bg-white/3 transition-colors group">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-9 h-9 rounded-full bg-primary-600/40 flex items-center justify-center
                                  text-sm font-semibold text-primary-300 shrink-0"
                      >
                        {{ emp.initials }}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-white">{{ emp.name }}</p>
                        <p class="text-xs text-slate-500">{{ emp.nip }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-sm text-slate-300">{{ emp.department }}</td>
                  <td class="px-5 py-4 text-sm text-slate-300">{{ emp.position }}</td>
                  <td class="px-5 py-4">
                    <span
                      [class]="statusClass(emp.status)"
                      class="text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {{ emp.status }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <div
                      class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <button
                        *hasPermission="'write:employee'"
                        class="text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        *hasPermission="'delete:employee'"
                        class="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-5 py-12 text-center text-slate-500 text-sm">
                    No employees found matching your search.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
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
