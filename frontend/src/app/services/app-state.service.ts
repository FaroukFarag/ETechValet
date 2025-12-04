import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SiteDto } from './sites.service';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private selectedSiteSubject = new BehaviorSubject<SiteDto | null>(null);
  public selectedSite$: Observable<SiteDto | null> = this.selectedSiteSubject.asObservable();

  constructor() {
    // Load selected site from localStorage on initialization
    this.loadSelectedSiteFromStorage();
  }

  private loadSelectedSiteFromStorage(): void {
    const storedSite = localStorage.getItem('selectedSite');
    if (storedSite) {
      try {
        const site = JSON.parse(storedSite);
        this.selectedSiteSubject.next(site);
      } catch (error) {
        console.error('Error loading selected site from storage:', error);
      }
    }
  }

  setSelectedSite(site: SiteDto | null): void {
    this.selectedSiteSubject.next(site);
    
    // Persist to localStorage
    if (site) {
      localStorage.setItem('selectedSite', JSON.stringify(site));
    } else {
      localStorage.removeItem('selectedSite');
    }
  }

  getSelectedSite(): SiteDto | null {
    return this.selectedSiteSubject.value;
  }

  clearSelectedSite(): void {
    this.setSelectedSite(null);
  }
}
















