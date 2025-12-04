import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiConfigService } from './api-config.service';

type ApiResponse<T> = {
  isSuccess?: boolean;
  data?: T;
  [key: string]: any;
};

export interface GateDto {
  id?: number;
  gateName?: string;
  name?: string;
  code?: string;
  siteId?: number;
  siteName?: string;
  site?: string;
  status?: string | number;
}

export interface CreateGatePayload {
  id: number;
  name: string;
  siteId: number;
  status: number;
}

export interface PaginationRequest {
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedGatesResponse {
  data?: GateDto[];
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
export class GatesService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  getAllGates(): Observable<GateDto[]> {
    const url = this.apiConfig.getFullUrl('gates/get-all');
    return this.http.get<ApiResponse<GateDto[]>>(url).pipe(
      map(response => response?.data ?? [])
    );
  }

  getPaginatedGates(pagination: PaginationRequest): Observable<PaginatedGatesResponse> {
    const url = this.apiConfig.getFullUrl('gates/get-all-paginated');
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

  createGate(payload: CreateGatePayload): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('gates/create');
    return this.http.post<ApiResponse<any>>(url, payload);
  }

  updateGate(payload: CreateGatePayload): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('gates/update');
    return this.http.put<ApiResponse<any>>(url, payload);
  }

  deleteGate(id: number): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl(`gates/delete/${id}`);
    return this.http.delete<ApiResponse<any>>(url);
  }

  getActiveGate(startTime: string, endTime: string): Observable<any> {
    const url = this.apiConfig.getFullUrl(`gates/get-active-gate?startTime=${startTime}&endTime=${endTime}`);
    return this.http.get<any>(url);
  }
}
