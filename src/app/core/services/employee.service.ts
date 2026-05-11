import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiResponse, Employee, EmployeePayload } from '../types/api.types';
import { PaginatedResourceService } from './paginated-resource.service';

@Injectable({ providedIn: 'root' })
export class EmployeeService extends PaginatedResourceService<Employee> {
  protected override endpoint = '/employees';

  // --- Aliases for template compatibility if needed ---
  readonly employees = this.items;

  create(payload: EmployeePayload) {
    return this.api.post<any>(this.endpoint, payload).pipe(
      tap((res) => {
        const newEmp = res?.data ?? res;
        if (newEmp) {
          this._items.update((list) => [...list, newEmp]);
        }
      }),
    );
  }

  update(id: string, payload: EmployeePayload) {
    return this.api.patch<any>(`${this.endpoint}/${id}`, payload).pipe(
      tap((res) => {
        const updated = res?.data ?? res;
        if (updated) {
          this._items.update((list) => list.map((e) => (e.id === id ? updated : e)));
        }
      }),
    );
  }
}
