import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SitesService, SiteDto } from '../../services/sites.service';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  sites: SiteDto[] = [];
  selectedSite: SiteDto | null = null;
  isSiteDropdownOpen = false;
  isProfileDropdownOpen = false;
  isLoadingSites = false;
  loadSitesError: string | null = null;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private sitesService: SitesService,
    private appStateService: AppStateService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadSites();
    this.subscribeToSelectedSite();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.site-selector') || target.closest('.profile-dropdown-container');
    
    if (!clickedInside) {
      this.isSiteDropdownOpen = false;
      this.isProfileDropdownOpen = false;
    }
  }
  
  private loadSites() {
    this.isLoadingSites = true;
    this.loadSitesError = null;
    
    this.sitesService.getAllSites()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sites) => {
          console.log('Loaded sites:', sites);
          this.sites = sites || [];
          this.isLoadingSites = false;
          // If no site is selected and sites are available, select the first one
          if (!this.selectedSite && this.sites.length > 0) {
            this.selectSite(this.sites[0]);
          }
        },
        error: (error) => {
          console.error('Error loading sites:', error);
          this.isLoadingSites = false;
          this.loadSitesError = 'Failed to load sites';
          this.sites = [];
        }
      });
  }
  
  private subscribeToSelectedSite() {
    this.appStateService.selectedSite$
      .pipe(takeUntil(this.destroy$))
      .subscribe(site => {
        this.selectedSite = site;
      });
  }
  
  toggleSiteDropdown() {
    this.isSiteDropdownOpen = !this.isSiteDropdownOpen;
    if (this.isSiteDropdownOpen) {
      this.isProfileDropdownOpen = false;
    }
  }
  
  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    if (this.isProfileDropdownOpen) {
      this.isSiteDropdownOpen = false;
    }
  }
  
  selectSite(site: SiteDto) {
    this.appStateService.setSelectedSite(site);
    this.isSiteDropdownOpen = false;
  }
  
  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
  
  changePassword() {
    this.isProfileDropdownOpen = false;
    // Implement change password logic
    console.log('Change password clicked');
  }
  
  logout() {
    this.isProfileDropdownOpen = false;
    // Clear selected site on logout
    this.appStateService.clearSelectedSite();
    // Clear any auth tokens
    localStorage.removeItem('token');
    // Navigate to login
    this.router.navigate(['/login']);
  }
}