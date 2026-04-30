import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ApiResponse, User, UserPayload } from '../types/api.types';
import { BaseApiService } from './base-api.service';


@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(BaseApiService);
  private readonly endpoint = '/users';

  // --- State ---
  private _users = signal<User[]>([]);
  private _loading = signal(false);
  private _total = signal(0);
  private _page = signal(1);
  private _limit = signal(10);
  private _searchQuery = signal('');
  private _sort = signal('createdAt:desc');
  private _hasNextPage = signal(false);

  // --- Public Signals (read-only) ---
  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly total = this._total.asReadonly();
  readonly page = this._page.asReadonly();
  readonly limit = this._limit.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly sort = this._sort.asReadonly();

  hasMore = this._hasNextPage.asReadonly();

  // --- Actions ---
  fetchAll(
    page: number = 1,
    append: boolean = false,
    search: string = '',
    limit: number = 10,
    sort: string = 'createdAt:desc',
  ) {
    this._loading.set(true);
    this._page.set(page);
    this._searchQuery.set(search);
    this._sort.set(sort);

    if (limit !== undefined) {
      this._limit.set(limit); // ✅ sync limit
    }

    const params = {
      page: page.toString(),
      limit: this._limit().toString(),
      search: search,
      sort: sort,
    };
    return this.api.get<ApiResponse<User[]>>(this.endpoint, params).pipe(
      tap({
        next: (res) => {
          if (append) {
            this._users.update((prev) => [...prev, ...res.data]);
          } else {
            this._users.set(res.data);
          }
          this._total.set(res.meta?.total ?? res.data.length);
          this._hasNextPage.set(res.meta?.hasNextPage ?? false);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  updateLimit(newLimit: number) {
    this._limit.set(newLimit);
    this._page.set(1);
  }

  nextPage() {
    if (this.hasMore()) this._page.update((p) => p + 1);
  }

  prevPage() {
    if (this._page() > 1) this._page.update((p) => p - 1);
  }

  getById(id: string) {
    return this.api.get<ApiResponse<User>>(`${this.endpoint}/${id}`);
  }

  create(payload: UserPayload) {
    return this.api.post<any>(this.endpoint, payload).pipe(
      tap((res) => {
        const newPos = res?.data ?? res;
        if (newPos) {
          this._users.update((list) => [...list, newPos]);
        }
      }),
    );
  }

  update(id: string, payload: UserPayload) {
    return this.api.patch<any>(`${this.endpoint}/${id}`, payload).pipe(
      tap((res) => {
        const updated = res?.data ?? res;
        if (updated) {
          this._users.update((list) => list.map((p) => (p.id === id ? updated : p)));
        }
      }),
    );
  }

  remove(id: string) {
    return this.api.delete<any>(`${this.endpoint}/${id}`).pipe(
      tap(() => {
        this._users.update((list) => list.filter((p) => p.id !== id));
      }),
    );
  }
}
