import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ApiResponse, Position } from '../types/api.types';
import { BaseApiService } from './base-api.service';

export interface PositionPayload {
  name: string;
  description: string;
  departmentId: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class PositionService {
  private api = inject(BaseApiService);
  private readonly endpoint = '/positions';

  // --- State ---
  private _positions = signal<Position[]>([]);
  private _loading = signal(false);
  private _total = signal(0);
  private _page = signal(1);
  private _limit = signal(10);
  private _searchQuery = signal('');
  private _sort = signal('createdAt:desc');
  private _hasNextPage = signal(false);

  // --- Public Signals (read-only) ---
  readonly positions = this._positions.asReadonly();
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
    return this.api.get<ApiResponse<Position[]>>(this.endpoint, params).pipe(
      tap({
        next: (res) => {
          if (append) {
            this._positions.update((prev) => [...prev, ...res.data]);
          } else {
            this._positions.set(res.data);
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

  create(payload: PositionPayload) {
    return this.api.post<any>(this.endpoint, payload).pipe(
      tap((res) => {
        const newPos = res?.data ?? res;
        if (newPos) {
          this._positions.update((list) => [...list, newPos]);
        }
      }),
    );
  }

  update(id: string, payload: PositionPayload) {
    return this.api.patch<any>(`${this.endpoint}/${id}`, payload).pipe(
      tap((res) => {
        const updated = res?.data ?? res;
        if (updated) {
          this._positions.update((list) => list.map((p) => (p.id === id ? updated : p)));
        }
      }),
    );
  }

  remove(id: string) {
    return this.api.delete<any>(`${this.endpoint}/${id}`).pipe(
      tap(() => {
        this._positions.update((list) => list.filter((p) => p.id !== id));
      }),
    );
  }
}
