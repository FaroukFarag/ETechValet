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

export interface ShiftDto {
  id?: number;
  name?: string;
  shiftName?: string;
  startTime?: string;
  endTime?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ShiftsService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  getAllShifts(): Observable<ShiftDto[]> {
    const url = this.apiConfig.getFullUrl('shifts/get-all');
    return this.http.get<ApiResponse<ShiftDto[]> | ShiftDto[]>(url).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response?.data ?? [];
      })
    );
  }
}


