import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  isSuccess: boolean;
  message?: string;
  token?: string;
  user?: any;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = this.apiConfig.getFullUrl('users/login');
    console.log('Login request URL:', url);
    console.log('Login request data:', credentials);
    return this.http.post<LoginResponse>(url, credentials);
  }
}

