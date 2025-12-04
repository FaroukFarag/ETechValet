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

export interface CardDto {
  id?: number;
  type?: number;
  cardNumber?: string;
  number?: string | number;
  siteId?: number | string;
  siteName?: string;
  status?: number;
  [key: string]: any;
}

export interface CreateCardPayload {
  id: number;
  type: number;
  number: number;
  siteId: number;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class CardsService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  getAllCards(): Observable<CardDto[]> {
    const url = this.apiConfig.getFullUrl('cards/get-all');
    return this.http.get<ApiResponse<CardDto[]> | CardDto[]>(url).pipe(
      map((response) => Array.isArray(response) ? response : (response?.data ?? []))
    );
  }

  createCard(payload: CreateCardPayload): Observable<any> {
    const url = this.apiConfig.getFullUrl('cards/create');
    return this.http.post(url, payload);
  }

  deleteCard(id: number): Observable<any> {
    const url = this.apiConfig.getFullUrl(`cards/delete/${id}`);
    return this.http.delete(url);
  }
}
