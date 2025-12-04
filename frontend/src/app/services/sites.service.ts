import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiConfigService } from './api-config.service';

type ApiResponse<T> = {
  isSuccess?: boolean;
  data?: T;
  [key: string]: any;
};

export interface PaginationRequest {
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedSitesResponse {
  data: SiteDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  isSuccess?: boolean;
  message?: string;
}

export interface SiteDto {
  id: number;
  siteName?: string;
  name?: string;
  companyId?: number;
  companyName?: string;
  fixedValue?: number | string;
  valueType?: string | number;
  percentage?: number | string;
  city?: string;
  address?: string;
  status?: string;
  extraServices?: Array<{
    label?: string;
    amount?: string | number;
    enabled?: boolean;
  }>;
}

export interface CreateSitePayload {
  id: number;
  name: string;
  companyId: number;
  valueType: number;
  fixedValue: number;
  percentage: string;
  address: string;
  status: string | number;
  extraServices?: Array<{
    label: string;
    amount: string | number;
    enabled: boolean;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class SitesService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  getAllSites(): Observable<SiteDto[]> {
    const url = this.apiConfig.getFullUrl('sites/get-all');
    return this.http.get<ApiResponse<SiteDto[]>>(url).pipe(
      map((response) => response?.data ?? [])
    );
  }

  getPaginatedSites(pagination: PaginationRequest): Observable<PaginatedSitesResponse> {
    const url = this.apiConfig.getFullUrl('sites/get-all-paginated');
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

  createSite(payload: CreateSitePayload): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('sites/create');
    return this.http.post<ApiResponse<any>>(url, payload);
  }

  updateSite(payload: CreateSitePayload): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('sites/update');
    return this.http.put<ApiResponse<any>>(url, payload);
  }

  deleteSite(id: number): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl(`sites/delete/${id}`);
    return this.http.delete<ApiResponse<any>>(url);
  }

  getSiteUsers(siteId: number): Observable<ApiResponse<any[]>> {
    const url = this.apiConfig.getFullUrl(`sites/get-site-users/${siteId}`);
    return this.http.get<ApiResponse<any[]>>(url);
  }
}
