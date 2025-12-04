import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiConfigService } from './api-config.service';

type ApiResponse<T> = {
  isSuccess?: boolean;
  data?: T;
  [key: string]: any;
};

export interface ValidatorDto {
  id?: number;
  name?: string;
  siteId?: number;
  siteName?: string;
  credits?: number;
  description?: string;
  canValidateParking?: boolean;
  canValidateValet?: boolean;
  discountFixedEnabled?: boolean;
  discountValue?: number;
  percentageEnabled?: boolean;
  percentageValue?: number | null;
  currentBalance?: number;
  totalAddedBalance?: number;
  totalUsedBalance?: number;
  totalValidation?: number;
  validatorSiteServices?: Array<{
    id: {
      siteId?: number;
      serviceId?: number;
      siteServiceId?: number;
      validatorId?: number;
    };
  }>;
}

export interface PaginatedValidatorsResponse {
  data?: ValidatorDto[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface PaginationRequest {
  pageNumber: number;
  pageSize: number;
}

export interface CreateValidatorPayload {
  name: string;
  siteId: number;
  credits: number;
  description: string;
  canValidateParking: boolean;
  canValidateValet: boolean;
  discountFixedEnabled: boolean;
  discountValue: number | null;
  percentageEnabled: boolean;
  percentageValue: number | null;
  validatorSiteServices: Array<{
    id: {
      siteId: number;
      serviceId: number;
    };
  }>;
}

export interface UpdateValidatorPayload {
  id: number;
  name: string;
  siteId: number;
  credits: number;
  description: string;
  canValidateParking: boolean;
  canValidateValet: boolean;
  discountFixedEnabled: boolean;
  discountValue: number | null;
  percentageEnabled: boolean;
  percentageValue: number | null;
  validatorSiteServices: Array<{
    id: {
      siteServiceId: number;
      validatorId: number;
    };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {
  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

  getAllValidators(): Observable<ValidatorDto[]> {
    const url = this.apiConfig.getFullUrl('validators/get-all');
    return this.http.get<ApiResponse<ValidatorDto[]>>(url).pipe(
      map((response) => response?.data ?? [])
    );
  }

  getValidatorById(id: number): Observable<ValidatorDto> {
    const url = this.apiConfig.getFullUrl(`validators/get-by-id/${id}`);
    return this.http.get<ApiResponse<ValidatorDto>>(url).pipe(
      map((response) => response?.data ?? {} as ValidatorDto)
    );
  }

  getPaginatedValidators(pagination: PaginationRequest): Observable<PaginatedValidatorsResponse> {
    const url = this.apiConfig.getFullUrl('validators/get-all-paginated');
    return this.http.post<any>(url, pagination).pipe(
      map((response) => {
        // Response structure: { isSuccess, message, data: ValidatorDto[], totalCount, totalPages }
        return {
          data: response?.data ?? [],
          totalCount: response?.totalCount ?? 0,
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
          totalPages: response?.totalPages ?? 0
        };
      })
    );
  }

  createValidator(payload: CreateValidatorPayload): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('validators/create');
    return this.http.post<ApiResponse<any>>(url, payload);
  }

  updateValidator(payload: UpdateValidatorPayload): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl('validators/update');
    return this.http.put<ApiResponse<any>>(url, payload);
  }

  deleteValidator(id: number): Observable<ApiResponse<any>> {
    const url = this.apiConfig.getFullUrl(`validators/delete/${id}`);
    return this.http.delete<ApiResponse<any>>(url);
  }
}

