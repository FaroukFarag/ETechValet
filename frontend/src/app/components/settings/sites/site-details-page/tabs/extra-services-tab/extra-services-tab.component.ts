import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteDto } from '../../../../../../services/sites.service';
import { SitesServicesService, SiteServiceDto } from '../../../../../../services/sites-services.service';
import { ServicesGridComponent, ExtraService } from './services-grid/services-grid.component';

@Component({
  selector: 'app-extra-services-tab',
  standalone: true,
  imports: [CommonModule, ServicesGridComponent],
  templateUrl: './extra-services-tab.component.html',
  styleUrls: ['./extra-services-tab.component.scss']
})
export class ExtraServicesTabComponent implements OnInit {
  @Input() site: SiteDto | null = null;

  services: ExtraService[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalCount = 0;

  constructor(private sitesServicesService: SitesServicesService) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    if (!this.site?.id) return;

    this.isLoading = true;
    
    this.sitesServicesService.getPaginatedSiteServices({
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (response) => {
        // Filter services for the current site
        const allServices = response.data || [];
        const siteServices = allServices.filter(service => {
          const serviceSiteId = service.siteId || (service as any).site?.id;
          return serviceSiteId === this.site?.id;
        });
        
        this.services = siteServices.map((dto: SiteServiceDto) => ({
          id: dto.id || 0,
          name: dto.serviceName || dto.name || 'Service',
          cost: dto.amount || dto.cost || 0
        }));
        
        // Update pagination info
        this.totalCount = siteServices.length;
        this.totalPages = response.totalPages || Math.ceil(this.totalCount / this.pageSize);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load site services', error);
        this.services = [];
        this.totalCount = 0;
        this.totalPages = 0;
        this.isLoading = false;
      }
    });
  }

  onServiceMenu(service: ExtraService) {
    console.log('Menu clicked for service:', service);
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadServices();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadServices();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadServices();
    }
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    if (this.totalPages <= 7) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    pages.push(1);
    if (this.currentPage > 3) {
      pages.push('...');
    }
    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(this.totalPages - 1, this.currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (this.currentPage < this.totalPages - 2) {
      pages.push('...');
    }
    pages.push(this.totalPages);
    return pages;
  }

  handlePageClick(page: number | string) {
    if (typeof page === 'number') {
      this.onPageChange(page);
    }
  }
}

