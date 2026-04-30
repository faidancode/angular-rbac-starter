import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiResponse } from '../types/api.types';
import { BaseApiService } from './base-api.service';
import {
  RoleDto,
  PermissionDto,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '../types/role.types';

@Injectable({
  providedIn: 'root',
})
export class RoleService extends BaseApiService {
  private readonly endpoint = '/roles';

  // --- State ---
  private _roles = signal<RoleDto[]>([]);
  private _loading = signal(false);
  private _total = signal(0);
  private _page = signal(1);
  private _limit = signal(10);
  private _searchQuery = signal('');
  private _sort = signal('createdAt:desc');
  private _hasNextPage = signal(false);

  // --- Public Signals ---
  readonly roles = this._roles.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly total = this._total.asReadonly();
  readonly page = this._page.asReadonly();
  readonly limit = this._limit.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly sort = this._sort.asReadonly();
  readonly hasMore = this._hasNextPage.asReadonly();

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
      this._limit.set(limit);
    }

    const params = {
      page: page.toString(),
      limit: this._limit().toString(),
      search,
      sort,
    };

    return this.get<ApiResponse<RoleDto[]>>(this.endpoint, params).pipe(
      tap({
        next: (res) => {
          if (append) {
            this._roles.update((prev) => [...prev, ...res.data]);
          } else {
            this._roles.set(res.data);
          }

          this._total.set(res.meta?.total ?? res.data.length);
          this._hasNextPage.set(res.meta?.hasNextPage ?? false);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  getAll(params?: Record<string, string | number | boolean | undefined>) {
    return this.get<ApiResponse<RoleDto[]>>(this.endpoint, params);
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
    return this.get<ApiResponse<RoleDto>>(`${this.endpoint}/${id}`);
  }

  getPermissions(): Observable<ApiResponse<PermissionDto[]>> {
    return this.get<ApiResponse<PermissionDto[]>>(`${this.endpoint}/permissions`);
  }

  create(data: CreateRoleRequest) {
    return this.post<ApiResponse<RoleDto>>(this.endpoint, data).pipe(
      tap((res) => {
        const created = res?.data ?? res;
        if (created) {
          this._roles.update((list) => [...list, created]);
        }
      }),
    );
  }

  update(id: string, data: UpdateRoleRequest) {
    return this.patch<ApiResponse<RoleDto>>(`${this.endpoint}/${id}`, data).pipe(
      tap((res) => {
        const updated = res?.data ?? res;
        if (updated) {
          this._roles.update((list) => list.map((role) => (role.id === id ? updated : role)));
        }
      }),
    );
  }

  remove(id: string) {
    return this.delete<ApiResponse<any>>(`${this.endpoint}/${id}`).pipe(
      tap(() => {
        this._roles.update((list) => list.filter((role) => role.id !== id));
      }),
    );
  }

  deleteRole(id: string) {
    return this.remove(id);
  }
}
