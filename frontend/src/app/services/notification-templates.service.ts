import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface CreateNotificationTemplatePayload {
  siteId: number;
  channel: number;
  messageType: string;
  messageTemplate: string;
  status: number;
}

export interface NotificationTemplateDto {
  id?: number;
  siteId?: number;
  siteName?: string;
  channel?: number | string;
  messageType?: string;
  messageTemplate?: string;
  status?: number | string;
}

export interface PaginationRequest {
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedNotificationTemplatesResponse {
  data?: NotificationTemplateDto[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  isSuccess?: boolean;
  message?: string;
}

export interface ApiResponse<T> {
  isSuccess?: boolean;
  data?: T;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationTemplatesService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  getAll(): Observable<NotificationTemplateDto[]> {
    const url = this.apiConfig.getFullUrl('notifications-templates/get-all');
    return this.http.get<ApiResponse<NotificationTemplateDto[]>>(url).pipe(
      map(response => response?.data ?? [])
    );
  }

  getPaginatedTemplates(pagination: PaginationRequest): Observable<PaginatedNotificationTemplatesResponse> {
    const url = this.apiConfig.getFullUrl('notifications-templates/get-all-paginated');
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

  create(payload: CreateNotificationTemplatePayload): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('notifications-templates/create');
    return this.http.post<ApiResponse<any>>(url, payload);
  }

  delete(id: number): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl(`notifications-templates/delete/${id}`);
    return this.http.delete<ApiResponse<any>>(url);
  }
}

