import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { User, UserPayload } from '../types/api.types';
import { PaginatedResourceService } from './paginated-resource.service';

@Injectable({ providedIn: 'root' })
export class UserService extends PaginatedResourceService<User> {
  protected override endpoint = '/users';

  // --- Aliases ---
  readonly users = this.items;

  create(payload: UserPayload) {
    return this.api.post<any>(this.endpoint, payload).pipe(
      tap((res) => {
        const newPos = res?.data ?? res;
        if (newPos) {
          this._items.update((list) => [...list, newPos]);
        }
      }),
    );
  }

  update(id: string, payload: UserPayload) {
    return this.api.patch<any>(`${this.endpoint}/${id}`, payload).pipe(
      tap((res) => {
        const updated = res?.data ?? res;
        if (updated) {
          this._items.update((list) => list.map((p) => (p.id === id ? updated : p)));
        }
      }),
    );
  }
}
