import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { ApiResponse } from '../types/api.types';
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
  private readonly _path = '/roles';

  getAll(params?: any): Observable<ApiResponse<RoleDto[]>> {
    return this.get<ApiResponse<RoleDto[]>>(this._path, params);
  }

  getById(id: string): Observable<ApiResponse<RoleDto>> {
    return this.get<ApiResponse<RoleDto>>(`${this._path}/${id}`);
  }

  getPermissions(): Observable<ApiResponse<PermissionDto[]>> {
    return this.get<ApiResponse<PermissionDto[]>>(`${this._path}/permissions`);
  }

  create(data: CreateRoleRequest): Observable<ApiResponse<RoleDto>> {
    return this.post<ApiResponse<RoleDto>>(this._path, data);
  }

  update(id: string, data: UpdateRoleRequest): Observable<ApiResponse<RoleDto>> {
    return this.patch<ApiResponse<RoleDto>>(`${this._path}/${id}`, data);
  }

  deleteRole(id: string): Observable<ApiResponse<any>> {
    return this.delete<ApiResponse<any>>(`${this._path}/${id}`);
  }
}
