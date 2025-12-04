import { Component, Input, OnInit, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationTemplatesService, NotificationTemplateDto, PaginatedNotificationTemplatesResponse } from '../../../../../../services/notification-templates.service';

@Component({
  selector: 'app-notification-template-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-template-tab.component.html',
  styleUrls: ['./notification-template-tab.component.scss']
})
export class NotificationTemplateTabComponent implements OnInit, OnChanges {
  @Input() siteId: number | null = null;

  templates: NotificationTemplateDto[] = [];
  isLoading = false;
  loadError: string | null = null;
  openMenuIndex: number | null = null;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalCount = 0;

  constructor(private templatesService: NotificationTemplatesService) {}

  ngOnInit() {
    this.loadTemplates();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['siteId'] && !changes['siteId'].firstChange) {
      this.loadTemplates();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-trigger') && !target.closest('.menu-panel')) {
      this.openMenuIndex = null;
    }
  }

  loadTemplates() {
    this.isLoading = true;
    this.loadError = null;

    const paginationPayload = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    console.log('Loading notification templates with pagination:', paginationPayload);

    this.templatesService.getPaginatedTemplates(paginationPayload).subscribe({
      next: (response) => {
        console.log('Notification templates response:', response);
        const templatesData = response.data ?? [];
        
        // Filter by siteId if provided (client-side filtering)
        if (this.siteId) {
          this.templates = templatesData.filter((template: NotificationTemplateDto) => {
            const templateSiteId = typeof template.siteId === 'string' 
              ? parseInt(template.siteId, 10) 
              : template.siteId;
            return templateSiteId === this.siteId;
          });
        } else {
          this.templates = templatesData;
        }
        
        // Use pagination data directly from backend response
        this.totalCount = response.totalCount ?? 0;
        this.totalPages = response.totalPages ?? 0;
        this.isLoading = false;
        this.openMenuIndex = null;
      },
      error: (error: any) => {
        console.error('Failed to load notification templates', error);
        this.loadError = 'Failed to load notification templates.';
        this.templates = [];
        this.totalCount = 0;
        this.totalPages = 0;
        this.isLoading = false;
      }
    });
  }

  get pageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 3) {
        pages.push('...');
      }
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) {
        pages.push('...');
      }
      pages.push(total);
    }

    return pages;
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadTemplates();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTemplates();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadTemplates();
    }
  }

  getChannelLabel(channel: number | string | undefined): string {
    if (channel === undefined || channel === null) return '-';
    const channelNum = typeof channel === 'string' ? parseInt(channel, 10) : channel;
    switch (channelNum) {
      case 1:
        return 'SMS';
      case 2:
        return 'WhatsApp';
      default:
        return '-';
    }
  }

  getStatusValue(status: number | string | undefined): number {
    if (status === undefined || status === null) return 2; // Default to inactive
    return typeof status === 'string' ? parseInt(status, 10) : status;
  }

  getStatusLabel(status: number | string | undefined): string {
    const statusValue = this.getStatusValue(status);
    return statusValue === 1 ? 'Active' : 'Inactive';
  }

  toggleMenu(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  editTemplate(template: NotificationTemplateDto, event: MouseEvent) {
    event.stopPropagation();
    this.openMenuIndex = null;
    // TODO: Implement edit functionality
    console.log('Edit template:', template);
  }

  deleteTemplate(template: NotificationTemplateDto, event: MouseEvent) {
    event.stopPropagation();
    this.openMenuIndex = null;
    
    if (!template.id) {
      console.error('Template ID is missing');
      return;
    }

    if (confirm('Are you sure you want to delete this template?')) {
      this.templatesService.delete(template.id).subscribe({
        next: (response: any) => {
          if (response?.isSuccess !== false) {
            this.loadTemplates(); // Reload templates
          } else {
            alert(response?.message || 'Failed to delete template');
          }
        },
        error: (error: any) => {
          console.error('Failed to delete template', error);
          alert('Failed to delete template. Please try again.');
        }
      });
    }
  }

}
