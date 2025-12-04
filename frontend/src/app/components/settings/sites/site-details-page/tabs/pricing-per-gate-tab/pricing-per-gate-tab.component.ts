import { Component, Input, OnInit, HostListener, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingsService, GatePricingDto } from '../../../../../../services/pricings.service';

export interface PricingPerGateRow {
  id: number;
  gateName: string;
  customerType: string;
  pricingType: string;
  valetPricing: string;
  parkingPricing: string;
  freeMinutes: string;
  days: string;
  order?: number;
}

@Component({
  selector: 'app-pricing-per-gate-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing-per-gate-tab.component.html',
  styleUrls: ['./pricing-per-gate-tab.component.scss']
})
export class PricingPerGateTabComponent implements OnInit, OnChanges {
  @Input() siteId: number | null = null;
  @Output() editPricing = new EventEmitter<PricingPerGateRow>();
  
  pricingData: PricingPerGateRow[] = [];
  isLoading = false;
  loadError: string | null = null;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalCount = 0;
  
  // Sorting
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // Drag and drop
  draggedRowIndex: number | null = null;
  dragOverRowIndex: number | null = null;

  // Delete confirmation
  showDeleteConfirm = false;
  isDeleting = false;
  pricingToDelete: PricingPerGateRow | null = null;

  constructor(
    private pricingsService: PricingsService
  ) {}

  ngOnInit() {
    this.loadPricingData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['siteId']) {
      this.currentPage = 1;
      this.loadPricingData();
    }
  }

  public loadPricingData() {
    this.isLoading = true;
    this.loadError = null;

    this.pricingsService.getPaginatedGatePricings({
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (response) => {
        const allGatePricings = response.data || [];
        this.pricingData = allGatePricings.map((dto, index) => this.mapDtoToRow(dto, index));
        this.totalCount = response.totalCount || allGatePricings.length;
        this.totalPages = response.totalPages || Math.max(1, Math.ceil(this.totalCount / this.pageSize));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load gate pricing data', error);
        this.loadError = 'Failed to load gate pricing data.';
        this.pricingData = [];
        this.totalCount = 0;
        this.totalPages = 0;
        this.isLoading = false;
      }
    });
  }

  private mapDtoToRow(dto: GatePricingDto, index: number): PricingPerGateRow {
    const customerTypeMap: { [key: number | string]: string } = {
      1: 'All Customers',
      2: 'Visitor',
      3: 'VIP',
      4: 'Regular'
    };

    const pricingTypeMap: { [key: number | string]: string } = {
      1: 'Fixed Amount',
      2: 'Hourly Rate',
      3: 'Daily Max Rate'
    };

    // Get gate name
    const gateName = dto.gateName || 'N/A';

    // Format valet pricing
    let valetPricing = 'Free';
    if (dto.valetPricingEnabled && dto.valetFixedPrice) {
      const price = typeof dto.valetFixedPrice === 'string' ? parseFloat(dto.valetFixedPrice) : dto.valetFixedPrice;
      if (price > 0) {
        valetPricing = `${price.toFixed(2)} SAR`;
      }
    } else {
      const pricingType = typeof dto.pricingType === 'string' ? parseInt(dto.pricingType, 10) : (dto.pricingType || 1);
      
      if (pricingType === 1 && dto.dailyRate) {
        const rate = typeof dto.dailyRate === 'string' ? parseFloat(dto.dailyRate) : dto.dailyRate;
        if (rate > 0) {
          valetPricing = `${rate.toFixed(2)} SAR`;
        }
      } else if (pricingType === 2 && dto.hourlyRate) {
        const hourly = typeof dto.hourlyRate === 'string' ? parseFloat(dto.hourlyRate) : dto.hourlyRate;
        if (hourly > 0) {
          valetPricing = `${hourly.toFixed(2)} SAR/hr`;
        }
      }
    }

    // Format parking pricing
    let parkingPricing = 'Free';
    if (dto.parkingPricingEnabled && dto.parkingFixedPrice) {
      const price = typeof dto.parkingFixedPrice === 'string' ? parseFloat(dto.parkingFixedPrice) : dto.parkingFixedPrice;
      if (price > 0) {
        parkingPricing = `${price.toFixed(2)} SAR`;
      }
    } else if (dto.parkingPricingType) {
      const parkingPricingType = typeof dto.parkingPricingType === 'string' ? parseInt(dto.parkingPricingType, 10) : dto.parkingPricingType;
      
      if (parkingPricingType === 1 && dto.parkingDailyRate) {
        const rate = typeof dto.parkingDailyRate === 'string' ? parseFloat(dto.parkingDailyRate) : dto.parkingDailyRate;
        if (rate > 0) {
          parkingPricing = `${rate.toFixed(2)} SAR`;
        }
      } else if (parkingPricingType === 2 && dto.parkingHourlyRate) {
        const hourly = typeof dto.parkingHourlyRate === 'string' ? parseFloat(dto.parkingHourlyRate) : dto.parkingHourlyRate;
        if (hourly > 0) {
          parkingPricing = `${hourly.toFixed(2)} SAR/hr`;
        }
      }
    }

    // Format free minutes
    let freeMinutes = '0 minutes';
    if (dto.freeHours) {
      if (typeof dto.freeHours === 'string') {
        const lowerStr = dto.freeHours.toLowerCase();
        if (lowerStr.includes('hour')) {
          const numMatch = dto.freeHours.match(/\d+/);
          if (numMatch) {
            const hours = parseFloat(numMatch[0]);
            const minutes = Math.round(hours * 60);
            freeMinutes = `${minutes} minutes`;
          } else {
            freeMinutes = dto.freeHours.replace(/hours?/gi, 'minutes');
          }
        } else {
          freeMinutes = dto.freeHours;
        }
      } else {
        const minutes = Math.round(dto.freeHours * 60);
        freeMinutes = `${minutes} minutes`;
      }
    }

    // Format days
    const dayNames = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    let days = 'All Days';
    if (dto.weekDayPricings && dto.weekDayPricings.length > 0) {
      const dayValues = dto.weekDayPricings.map(wdp => wdp.dayOfWeek).sort((a, b) => a - b);
      days = dayValues.map(d => dayNames[d]).join(', ');
    }

    return {
      id: dto.id || 0,
      gateName: gateName,
      customerType: customerTypeMap[dto.customerType || 1] || String(dto.customerType || 'Unknown'),
      pricingType: pricingTypeMap[dto.pricingType || 1] || String(dto.pricingType || 'Unknown'),
      valetPricing: valetPricing,
      parkingPricing: parkingPricing,
      freeMinutes: freeMinutes,
      days: days,
      order: (dto as any).order ?? index
    };
  }

  // Drag and drop handlers
  onDragStart(event: DragEvent, index: number) {
    this.draggedRowIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index.toString());
    }
  }

  onDragEnd(event: DragEvent) {
    this.draggedRowIndex = null;
    this.dragOverRowIndex = null;
  }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverRowIndex = index;
  }

  onDragLeave(event: DragEvent) {
    this.dragOverRowIndex = null;
  }

  onDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    
    if (this.draggedRowIndex !== null && this.draggedRowIndex !== dropIndex) {
      const draggedItem = this.pricingData[this.draggedRowIndex];
      this.pricingData.splice(this.draggedRowIndex, 1);
      this.pricingData.splice(dropIndex, 0, draggedItem);
      
      // Update order values
      this.pricingData.forEach((row, idx) => {
        row.order = idx + 1;
      });

      // TODO: Call API to save reordered pricings if needed
      // this.saveReorderedPricings();
    }
    
    this.draggedRowIndex = null;
    this.dragOverRowIndex = null;
  }

  // Edit handler
  onEditClick(row: PricingPerGateRow, event: Event) {
    event.stopPropagation();
    this.editPricing.emit(row);
  }

  // Delete handlers
  onDeleteClick(row: PricingPerGateRow, event: Event) {
    event.stopPropagation();
    this.pricingToDelete = row;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.pricingToDelete = null;
  }

  confirmDelete() {
    if (!this.pricingToDelete) return;

    this.isDeleting = true;
    
    this.pricingsService.deleteGatePricing(this.pricingToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteConfirm = false;
        this.pricingToDelete = null;
        this.loadPricingData();
      },
      error: (error) => {
        console.error('Failed to delete gate pricing', error);
        this.isDeleting = false;
        this.showDeleteConfirm = false;
        this.pricingToDelete = null;
      }
    });
  }

  // Pagination handlers
  onPageChange(page: number | string) {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadPricingData();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPricingData();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPricingData();
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

  // Sorting
  onSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    // TODO: Implement actual sorting logic
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'both';
    }
    return this.sortDirection === 'asc' ? 'up' : 'down';
  }
}
