import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';

type ApiResponse<T> = {
  isSuccess?: boolean;
  data?: T;
  [key: string]: any;
};

export interface CreateSiteServicePayload {
  siteId: number;
  serviceId: number;
  amount: number;
}

export interface PaginationRequest {
  pageNumber: number;
  pageSize: number;
}

export interface SiteServiceDto {
  id?: number;
  siteId?: number;
  serviceId?: number;
  serviceName?: string;
  name?: string;
  amount?: number;
  cost?: number;
  status?: number;
  [key: string]: any;
}

export interface PaginatedSiteServicesResponse {
  data?: SiteServiceDto[];
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
export class SitesServicesService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  getPaginatedSiteServices(pagination: PaginationRequest): Observable<PaginatedSiteServicesResponse> {
    const url = this.apiConfig.getFullUrl('sites-services/get-all-paginated');
    return this.http.post<any>(url, pagination).pipe(
      map((response) => {
        return {
          data: response?.data ?? [],
          totalCount: response?.totalCount ?? 0,
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
          totalPages: response?.totalPages ?? 0,
          isSuccess: response?.isSuccess,
          message: response?.message
        };
      })
    );
  }

  createSiteService(payload: CreateSiteServicePayload): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('sites-services/create');
    return this.http.post<ApiResponse<any>>(url, payload);
  }
}







