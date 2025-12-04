import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface PickupRequestDto {
  id?: number;
  requestNumber?: string;
  gateName?: string;
  siteName?: string;
  createdAt?: string;
  plateNumber?: string;
  customerMobileNumber?: string;
  cardNumber?: string;
  customerType?: string;
  paymentType?: number | string;
  amount?: number | string;
  status?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class PickupRequestsService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  getRequestsByStatus(status: number): Observable<PickupRequestDto[]> {
    const url = this.apiConfig.getFullUrl(`pickup-requests/get-all-by-status/${status}`);
    return this.http.get<PickupRequestDto[]>(url);
  }

  createRequestWithPhotos(payload: FormData): Observable<any> {
    const url = this.apiConfig.getFullUrl('pickup-requests/create-with-photos');
    return this.http.post(url, payload);
  }

  getTopCustomerType(startTime: string, endTime: string): Observable<any> {
    const url = this.apiConfig.getFullUrl(`pickup-requests/get-top-customer-type?startTime=${startTime}&endTime=${endTime}`);
    return this.http.get<any>(url);
  }

  getTotalParkedRequests(startTime: string, endTime: string): Observable<any> {
    const url = this.apiConfig.getFullUrl(`pickup-requests/get-total-parked-requests?startTime=${startTime}&endTime=${endTime}`);
    return this.http.get<any>(url);
  }

  getAverageParkingTime(startTime: string, endTime: string): Observable<any> {
    const url = this.apiConfig.getFullUrl(`pickup-requests/get-average-parking-time?startTime=${startTime}&endTime=${endTime}`);
    return this.http.get<any>(url);
  }

  getTotalRevenue(startTime?: string, endTime?: string): Observable<any> {
    let url = this.apiConfig.getFullUrl('pickup-requests/get-total-revenue');
    
    // Add date parameters if provided
    const params: string[] = [];
    if (startTime) {
      params.push(`startTime=${startTime}`);
    }
    if (endTime) {
      params.push(`endTime=${endTime}`);
    }
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return this.http.get<any>(url);
  }
}


