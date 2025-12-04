import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';

type ApiResponse<T> = {
  isSuccess?: boolean;
  data?: T;
  message?: string;
  [key: string]: any;
};

export interface PaginationRequest {
  pageNumber: number;
  pageSize: number;
}

export interface CreateCustomerTypePayload {
  name: string;
  siteId: number;
}

export interface CustomerTypeDto {
  id?: number;
  siteId?: number | string;
  name?: string;
  code?: string;
  description?: string;
  totalCustomers?: number | string;
  status?: number | string;
  updatedAt?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface PaginatedCustomerTypesResponse {
  data?: CustomerTypeDto[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  isSuccess?: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerTypesService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  getPaginatedCustomerTypes(pagination: PaginationRequest): Observable<PaginatedCustomerTypesResponse> {
    const url = this.apiConfig.getFullUrl('customer-types/get-all-paginated');
    return this.http.post<any>(url, pagination).pipe(
      map((response) => ({
        data: response?.data ?? [],
        totalCount: response?.totalCount ?? 0,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        totalPages: response?.totalPages ?? 0,
        isSuccess: response?.isSuccess,
        message: response?.message
      }))
    );
  }

  createCustomerType(payload: CreateCustomerTypePayload): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('customer-types/create');
    return this.http.post<ApiResponse<any>>(url, payload);
  }

  updateCustomerType(payload: { id: number; name: string; siteId: number }): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('customer-types/update');
    return this.http.put<ApiResponse<any>>(url, payload);
  }

  deleteCustomerType(id: number): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl(`customer-types/delete/${id}`);
    return this.http.delete<ApiResponse<any>>(url);
  }
}


