import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiConfigService } from './api-config.service';

type ApiResponse<T> = {
  isSuccess?: boolean;
  data?: T;
  [key: string]: any;
};

export interface CompanyDto {
  id: number;
  name: string;
  shortName: string;
  contactPerson: string;
  phoneNumber: string;
  address: string;
  commercialRegistration: string;
}

export interface CreateCompanyPayload {
  id: number;
  name: string;
  shortName: string;
  contactPerson: string;
  phoneNumber: string;
  address: string;
  commercialRegistration: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompaniesService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  createCompany(payload: CreateCompanyPayload): Observable<any> {
     const url = this.apiConfig.getFullUrl('companies/create');
     return this.http.post(url, payload);
   }

  updateCompany(payload: CreateCompanyPayload): Observable<any> {
     const url = this.apiConfig.getFullUrl('companies/update');
     return this.http.put(url, payload);
   }

  deleteCompany(id: number): Observable<any> {
    const url = this.apiConfig.getFullUrl(`companies/delete/${id}`);
    return this.http.delete(url);
  }

  getAllCompanies(): Observable<CompanyDto[]> {
    const url = this.apiConfig.getFullUrl('companies/get-all');
    return this.http
      .get<ApiResponse<CompanyDto[]>>(url)
      .pipe(map((response) => response?.data ?? []));
  }
}
