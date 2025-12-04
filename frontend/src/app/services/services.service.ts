import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiConfigService } from './api-config.service';

type ApiResponse<T> = {
  isSuccess?: boolean;
  data?: T;
  [key: string]: any;
};

export interface ServiceDto {
  id?: number;
  name?: string;
  description?: string;
  serviceName?: string;
  serviceDescription?: string;
  title?: string;
  status?: string | number;
}

export interface CreateServicePayload {
  id: number;
  name: string;
  description: string;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  getAllServices(): Observable<ServiceDto[]> {
    const url = this.apiConfig.getFullUrl('services/get-all');
    return this.http.get<ApiResponse<ServiceDto[]>>(url).pipe(
      map(response => response?.data ?? [])
    );
  }

  createService(payload: CreateServicePayload): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('services/create');
    return this.http.post<ApiResponse<any>>(url, payload);
  }

  updateService(payload: CreateServicePayload): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('services/update');
    return this.http.put<ApiResponse<any>>(url, payload);
  }

  deleteService(id: number): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl(`services/delete/${id}`);
    return this.http.delete<ApiResponse<any>>(url);
  }
}

