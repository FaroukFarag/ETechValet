import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiConfigService } from './api-config.service';

type ApiResponse<T> = {
  isSuccess?: boolean;
  data?: T;
  message?: string;
  [key: string]: any;
};

export interface WeekDayPricing {
  weekDayPricingType: number;
  dayOfWeek: number;
  hourlyRate: number;
  dailyRate: number;
  freeHours: number;
  dailyMaxRate: number;
}

export interface CreatePricingPayload {
  siteId: number;
  customerType: number;
  pricingType: number;
  dailyRate: number;
  freeHours: number;
  hourlyRate: number;
  dailyMaxRate: number;
  parkingEnabled: boolean;
  parkingPricingType: number;
  parkingDailyRate: number;
  parkingFreeHours: number;
  parkingHourlyRate: number;
  applyToAllGates: boolean;
  weekDayBasedEnabled: boolean;
  weekDayPricings: WeekDayPricing[];
}

export interface PricingDto {
  id?: number;
  siteId?: number;
  customerType?: number | string;
  pricingType?: number | string;
  dailyRate?: number | string;
  hourlyRate?: number | string;
  dailyMaxRate?: number | string;
  freeHours?: number | string;
  parkingEnabled?: boolean;
  parkingPricingType?: number | string;
  parkingDailyRate?: number | string;
  parkingHourlyRate?: number | string;
  parkingFreeHours?: number | string;
  weekDayPricings?: WeekDayPricing[];
}

export interface PaginationRequest {
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedPricingsResponse {
  data?: PricingDto[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  isSuccess?: boolean;
  message?: string;
}

export interface GatePricingDto {
  id?: number;
  gateId?: number;
  gateName?: string;
  siteId?: number;
  customerType?: number | string;
  pricingType?: number | string;
  dailyRate?: number | string;
  hourlyRate?: number | string;
  dailyMaxRate?: number | string;
  freeHours?: number | string;
  valetPricingEnabled?: boolean;
  valetFixedPrice?: number | string;
  parkingPricingEnabled?: boolean;
  parkingFixedPrice?: number | string;
  parkingPricingType?: number | string;
  parkingDailyRate?: number | string;
  parkingHourlyRate?: number | string;
  weekDayPricings?: WeekDayPricing[];
  [key: string]: any;
}

export interface PaginatedGatePricingsResponse {
  data?: GatePricingDto[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  isSuccess?: boolean;
  message?: string;
}

export interface UpdatePricingPayload {
  id: number;
  type: number;
  number: number;
  siteId: number;
  status: number;
}

export interface ReOrderPricingDto {
  order: number;
  id: number;
}

export interface ReorderPricingsPayload {
  siteId: number;
  reOrderPricingDtos: ReOrderPricingDto[];
}

export interface CreateGatePricingPayload {
  id: {
    gateId: number;
  };
  enableValetPricing: boolean;
  enableParkingPricing: boolean;
  pricing: {
    siteId: number;
    customerType: number;
    pricingType: number;
    dailyRate: number;
    freeHours: number;
    hourlyRate: number;
    dailyMaxRate: number;
    parkingEnabled: boolean;
    parkingPricingType: number;
    parkingDailyRate: number;
    parkingFreeHours: number;
    parkingHourlyRate: number;
    applyToAllGates: boolean;
    weekDayBasedEnabled: boolean;
    weekDayPricings: WeekDayPricing[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class PricingsService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  createPricing(payload: CreatePricingPayload): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('pricings/create');
    return this.http.post<ApiResponse<any>>(url, payload);
  }

  getPaginatedPricings(pagination: PaginationRequest): Observable<PaginatedPricingsResponse> {
    const url = this.apiConfig.getFullUrl('pricings/get-all-paginated');
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

  getPaginatedGatePricings(pagination: PaginationRequest): Observable<PaginatedGatePricingsResponse> {
    const url = this.apiConfig.getFullUrl('gates-pricings/get-all-paginated');
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

  createGatePricing(payload: CreateGatePricingPayload): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('gates-pricings/create');
    return this.http.post<ApiResponse<any>>(url, payload);
  }

  deletePricing(id: number): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl(`pricings/delete/${id}`);
    return this.http.delete<ApiResponse<any>>(url);
  }

  deleteGatePricing(id: number): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl(`gate-pricings/delete/${id}`);
    return this.http.delete<ApiResponse<any>>(url);
  }

  updatePricing(payload: UpdatePricingPayload): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('pricings/update');
    return this.http.put<ApiResponse<any>>(url, payload);
  }

  reorderPricings(payload: ReorderPricingsPayload): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('pricings/reorder-pricings');
    return this.http.patch<ApiResponse<any>>(url, payload);
  }
}

