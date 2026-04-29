import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { ApiResponse, Employee, EmployeePayload } from '../types/api.types';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private api = inject(BaseApiService);
  private readonly endpoint = '/employees';

  // --- State ---
  private _employees = signal<Employee[]>([]);
  private _loading = signal(false);
  private _total = signal(0);
  private _page = signal(1);
  private _limit = signal(10);
  private _searchQuery = signal('');
  private _sort = signal('createdAt:desc');
  private _hasNextPage = signal(false);

  // --- Public Signals (read-only) ---
  readonly employees = this._employees.asReadonly();
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
    console.log('Fetching with params:', params);

    return this.api.get<ApiResponse<Employee[]>>(this.endpoint, params).pipe(
      tap({
        next: (res) => {
          if (append) {
            this._employees.update((prev) => [...prev, ...res.data]);
          } else {
            this._employees.set(res.data);
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

  create(payload: EmployeePayload) {
    return this.api.post<any>(this.endpoint, payload).pipe(
      tap((res) => {
        // Menangani struktur data { data: Employee } atau Employee langsung
        const newEmp = res?.data ?? res;
        if (newEmp) {
          this._employees.update((list) => [...list, newEmp]);
        }
      }),
    );
  }

  update(id: string, payload: EmployeePayload) {
    return this.api.patch<any>(`${this.endpoint}/${id}`, payload).pipe(
      tap((res) => {
        const updated = res?.data ?? res;
        if (updated) {
          this._employees.update((list) => list.map((e) => (e.id === id ? updated : e)));
        }
      }),
    );
  }

  remove(id: string) {
    return this.api.delete<any>(`${this.endpoint}/${id}`).pipe(
      tap(() => {
        this._employees.update((list) => list.filter((e) => e.id !== id));
      }),
    );
  }
}
