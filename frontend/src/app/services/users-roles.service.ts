import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface RoleDto {
  id: number;
  name: string;
}

export interface CreateRolePayload {
  name: string;
}

export interface UserDto {
  id?: number;
  username?: string;
  userName?: string;
  name?: string;
  fullName?: string;
  phoneNumber?: string;
  phone?: string;
  mobile?: string;
  role?: string;
  roleName?: string;
  userRole?: string;
  email?: string;
  emailAddress?: string;
  password?: string;
  passwordHidden?: string;
  status?: string | number;
  isActive?: boolean | number;
  [key: string]: any; // Allow additional properties
}

export interface PaginationRequest {
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedRolesResponse {
  data?: RoleDto[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface PaginatedUsersResponse {
  data?: UserDto[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersRolesService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  createRole(payload: CreateRolePayload): Observable<any> {
    const url = this.apiConfig.getFullUrl('roles/create');
    return this.http.post(url, payload);
  }

  getAllRoles(): Observable<RoleDto[]> {
    const url = this.apiConfig.getFullUrl('roles/get-all');
    return this.http.get<{ data?: RoleDto[] }>(url).pipe(map(res => res?.data ?? []));
  }

  getPaginatedRoles(pagination: PaginationRequest): Observable<PaginatedRolesResponse> {
    const url = this.apiConfig.getFullUrl('roles/get-all-paginated');
    return this.http.post<any>(url, pagination).pipe(
      map((response) => {
        // Response structure: { isSuccess, message, data: RoleDto[], totalCount, totalPages }
        return {
          data: response?.data ?? [],
          totalCount: response?.totalCount ?? 0,
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
          totalPages: response?.totalPages ?? 0
        };
      })
    );
  }

  updateRole(payload: RoleDto): Observable<any> {
    const url = this.apiConfig.getFullUrl('roles/update');
    return this.http.put(url, payload);
  }

  deleteRole(id: number): Observable<any> {
    const url = this.apiConfig.getFullUrl(`roles/delete/${id}`);
    return this.http.delete(url);
  }

  getPaginatedUsers(pagination: PaginationRequest): Observable<PaginatedUsersResponse> {
    const url = this.apiConfig.getFullUrl('users/get-all-paginated');
    return this.http.post<any>(url, pagination).pipe(
      map((response) => {
        // Response structure: { isSuccess, message, data: UserDto[], totalCount, totalPages }
        // Return the response as-is to allow component to handle isSuccess: false
        return {
          data: response?.data ?? [],
          totalCount: response?.totalCount ?? 0,
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
          totalPages: response?.totalPages ?? 0,
          isSuccess: response?.isSuccess,
          message: response?.message
        } as any;
      })
    );
  }

  createUser(payload: CreateUserPayload): Observable<any> {
    const url = this.apiConfig.getFullUrl('users/create');
    return this.http.post<any>(url, payload);
  }

  updateMemberData(payload: UpdateMemberDataPayload): Observable<any> {
    const url = this.apiConfig.getFullUrl('users/update-member-data');
    return this.http.patch<any>(url, payload);
  }

  getTeamMembers(): Observable<ApiResponse<UserDto[]>> {
    const url = this.apiConfig.getFullUrl('users/get-team-members');
    return this.http.get<ApiResponse<UserDto[]>>(url);
  }

  getSiteUsers(siteId: number): Observable<ApiResponse<UserDto[]>> {
    const url = this.apiConfig.getFullUrl(`users/get-site-users/${siteId}`);
    return this.http.get<ApiResponse<UserDto[]>>(url);
  }
}

export interface ApiResponse<T> {
  isSuccess?: boolean;
  data?: T;
  message?: string;
  [key: string]: any;
}

export interface UpdateMemberDataPayload {
  userName: string;
  siteId: number;
  phoneNumber?: string;
  workingHours: number;
  userGates: Array<{ id: { gateId: number } }>;
}

export interface CreateUserPayload {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  status: number;
  roles: Array<{ name: string }>;
}
