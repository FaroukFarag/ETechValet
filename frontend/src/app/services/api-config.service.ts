import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  // Use absolute URL to send requests to the remote server
  private readonly baseUrl = 'http://8.208.12.34:3000/api/';

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getFullUrl(endpoint: string): string {
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    console.log('Constructed API URL:', url);
    return url;
  }
}

