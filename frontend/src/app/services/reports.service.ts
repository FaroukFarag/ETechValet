import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiConfigService } from './api-config.service';

type ApiResponse<T> = {
  isSuccess?: boolean;
  data?: T;
  message?: string;
  [key: string]: any;
};

export interface ShiftSalesReportDto {
  id?: number;
  requestNo?: string;
  requestNumber?: string;
  siteName?: string;
  createdAt?: string;
  startTime?: string;
  plateNumber?: string;
  gateName?: string;
  customerMobileNumber?: string;
  receivedByName?: string;
  parkedByName?: string;
  deliveredByName?: string;
  carWashStatus?: string | number;
  amount?: number | string;
  paymentType?: number | string;
  notes?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  getShiftSalesReport(shiftDate?: string): Observable<ShiftSalesReportDto[]> {
    const url = this.apiConfig.getFullUrl('reports/get-shift-sales-report');
    
    // Only add shiftDate parameter if it's provided
    let params = new HttpParams();
    if (shiftDate) {
      params = params.set('shiftDate', shiftDate);
    }
    
    return this.http.get<ApiResponse<ShiftSalesReportDto[]> | ShiftSalesReportDto[]>(url, { params }).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response?.data ?? [];
      })
    );
  }

  getDateSalesReport(startTime?: string, endTime?: string): Observable<ShiftSalesReportDto[]> {
    const url = this.apiConfig.getFullUrl('reports/get-date-sales-report');
    
    // Only add date parameters if they're provided
    let params = new HttpParams();
    if (startTime) {
      params = params.set('startTime', startTime);
    }
    if (endTime) {
      params = params.set('endTime', endTime);
    }
    
    return this.http.get<ApiResponse<ShiftSalesReportDto[]> | ShiftSalesReportDto[]>(url, { params }).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response?.data ?? [];
      })
    );
  }

  getDriverProductivityReport(startTime?: string, endTime?: string): Observable<any[]> {
    const url = this.apiConfig.getFullUrl('reports/get-driver-productivity-report');
    
    // Only add date parameters if they're provided
    let params = new HttpParams();
    if (startTime) {
      params = params.set('startTime', startTime);
    }
    if (endTime) {
      params = params.set('endTime', endTime);
    }
    
    return this.http.get<ApiResponse<any[]> | any[]>(url, { params }).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response?.data ?? [];
      })
    );
  }
}

