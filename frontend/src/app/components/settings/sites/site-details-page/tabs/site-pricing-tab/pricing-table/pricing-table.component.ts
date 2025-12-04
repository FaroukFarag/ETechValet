import { Component, Input, Output, EventEmitter, HostListener, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingsService, PricingDto, ReorderPricingsPayload } from '../../../../../../../services/pricings.service';

export interface PricingRow {
  id: number;
  customerType: string;
  pricingType: string;
  valetPricing: string;
  parkingPricing: string;
  freeMinutes: string;
  days: string;
}

@Component({
  selector: 'app-pricing-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing-table.component.html',
  styleUrls: ['./pricing-table.component.scss']
})
export class PricingTableComponent implements OnInit, OnChanges {
  @Input() siteId: number | null = null;
  @Output() exportClick = new EventEmitter<void>();
  @Output() addPricingClick = new EventEmitter<void>();
  @Output() menuClick = new EventEmitter<{ row: PricingRow; action: string }>();

  pricingData: PricingRow[] = [];
  isLoading = false;
  loadError: string | null = null;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalCount = 0;

  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  openMenuIndex: number | null = null;
  
  // Drag and drop
  draggedRowIndex: number | null = null;
  dragOverRowIndex: number | null = null;

  // Delete confirmation
  showDeleteConfirm = false;
  isDeleting = false;
  pricingToDelete: PricingRow | null = null;

  constructor(private pricingsService: PricingsService) {}

  ngOnInit() {
    // If siteId is already set, load pricings immediately
    // Otherwise, wait for siteId to be set via input binding
    if (this.siteId) {
      this.loadPricings();
    } else {
      console.log('Waiting for siteId to be set via input binding...');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reload when siteId changes (including initial set)
    if (changes['siteId']) {
      const newSiteId = changes['siteId'].currentValue;
      const previousSiteId = changes['siteId'].previousValue;
      console.log(`siteId changed from ${previousSiteId} to ${newSiteId}`);
      
      // Reset to first page when siteId changes
      if (newSiteId !== previousSiteId) {
        this.currentPage = 1;
        this.loadPricings();
      }
    }
  }

  loadPricings() {
    this.isLoading = true;
    this.loadError = null;

    console.log('Loading pricings for siteId:', this.siteId);

    this.pricingsService.getPaginatedPricings({
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (response) => {
        console.log('Received pricing response:', response);
        
        // Get all pricings from backend
        const allPricings = response.data || [];
        console.log('All pricings from backend:', allPricings);
        console.log('All pricings count:', allPricings.length);
        console.log('Current siteId:', this.siteId);
        
        // Filter by siteId if provided
        let sitePricings = allPricings;
        if (this.siteId && this.siteId !== null && this.siteId !== undefined) {
          const currentSiteId = typeof this.siteId === 'string' 
            ? parseInt(this.siteId, 10) 
            : this.siteId;
          
          console.log('Filtering by siteId:', currentSiteId);
          
          sitePricings = allPricings.filter(pricing => {
            if (!pricing || pricing.siteId === null || pricing.siteId === undefined) {
              console.log('Pricing has no siteId:', pricing);
              return false;
            }
            
            const pricingSiteId = typeof pricing.siteId === 'string' 
              ? parseInt(pricing.siteId, 10) 
              : pricing.siteId;
            
            const match = pricingSiteId === currentSiteId;
            if (!match) {
              console.log(`Pricing siteId (${pricingSiteId}) does not match current siteId (${currentSiteId})`);
            }
            return match;
          });
          
          console.log(`Filtered ${sitePricings.length} pricings out of ${allPricings.length} for siteId ${currentSiteId}`);
          
          // If filtering results in no data, show all data for debugging
          if (sitePricings.length === 0 && allPricings.length > 0) {
            console.warn('Filtering resulted in no data! Showing all pricings for debugging.');
            console.warn('This means the siteId filtering might be too strict or siteIds do not match.');
            sitePricings = allPricings; // Temporarily show all data
          }
        } else {
          console.log('No siteId provided, showing all pricings');
          console.log(`Showing all ${allPricings.length} pricings`);
        }

        console.log('Pricings to display:', sitePricings);
        console.log('Pricings count:', sitePricings.length);

        // Map DTOs to rows with error handling
        try {
          this.pricingData = sitePricings.map((dto, index) => {
            try {
              return this.mapDtoToRow(dto);
            } catch (error) {
              console.error(`Error mapping pricing at index ${index}:`, error, dto);
              // Return a fallback row
              return {
                id: dto.id || 0,
                customerType: 'Unknown',
                pricingType: 'Unknown',
                valetPricing: 'N/A',
                parkingPricing: 'N/A',
                freeMinutes: 'N/A',
                days: 'N/A'
              };
            }
          });
          console.log('Mapped pricing data:', this.pricingData);
          console.log('Pricing data length:', this.pricingData.length);
        } catch (error) {
          console.error('Error mapping pricings:', error);
          this.pricingData = [];
        }
        
        // Update pagination info based on actual displayed data
        this.totalCount = this.pricingData.length;
        this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
        
        console.log('Final pricing data count:', this.pricingData.length);
        console.log('Total count:', this.totalCount, 'Total pages:', this.totalPages);
        console.log('Is loading complete. Data ready for display:', this.pricingData.length > 0);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load pricings', error);
        this.loadError = 'Failed to load pricings. Please try again.';
        this.pricingData = [];
        this.totalCount = 0;
        this.totalPages = 0;
        this.isLoading = false;
      }
    });
  }

  private mapDtoToRow(dto: PricingDto): PricingRow {
    // Map customer type
    const customerTypeMap: { [key: number | string]: string } = {
      1: 'All Customers',
      2: 'Visitor',
      3: 'VIP',
      4: 'Regular',
      'All Customers': 'All Customers',
      'Visitor': 'Visitor',
      'VIP': 'VIP',
      'Regular': 'Regular'
    };

    // Map pricing type
    const pricingTypeMap: { [key: number | string]: string } = {
      1: 'Fixed Amount',
      2: 'Hourly Rate',
      3: 'Daily Max Rate',
      'Fixed Amount': 'Fixed Amount',
      'Hourly Rate': 'Hourly Rate',
      'Daily Max Rate': 'Daily Max Rate'
    };

    // Format valet pricing based on pricing type
    let valetPricing = 'Free';
    const pricingType = typeof dto.pricingType === 'string' ? parseInt(dto.pricingType, 10) : (dto.pricingType || 1);
    
    if (pricingType === 1) {
      // Fixed Amount - show dailyRate
      if (dto.dailyRate) {
        const rate = typeof dto.dailyRate === 'string' ? parseFloat(dto.dailyRate) : dto.dailyRate;
        if (rate > 0) {
          valetPricing = `${rate.toFixed(2)} SAR`;
        }
      }
    } else if (pricingType === 2) {
      // Hourly Rate - show hourlyRate and dailyMaxRate
      if (dto.hourlyRate) {
        const hourly = typeof dto.hourlyRate === 'string' ? parseFloat(dto.hourlyRate) : dto.hourlyRate;
        if (hourly > 0) {
          valetPricing = `${hourly.toFixed(2)} SAR/hr`;
          if (dto.dailyMaxRate) {
            const maxRate = typeof dto.dailyMaxRate === 'string' ? parseFloat(dto.dailyMaxRate) : dto.dailyMaxRate;
            if (maxRate > 0) {
              valetPricing += ` (Max ${maxRate.toFixed(2)} SAR/day)`;
            }
          }
        }
      }
    } else if (pricingType === 3) {
      // Daily Max Rate - show dailyMaxRate
      if (dto.dailyMaxRate) {
        const maxRate = typeof dto.dailyMaxRate === 'string' ? parseFloat(dto.dailyMaxRate) : dto.dailyMaxRate;
        if (maxRate > 0) {
          valetPricing = `Max ${maxRate.toFixed(2)} SAR/day`;
        }
      }
    }

    // Format parking pricing based on parking pricing type
    let parkingPricing = 'Free';
    if (dto.parkingEnabled) {
      const parkingPricingType = typeof dto.parkingPricingType === 'string' ? parseInt(dto.parkingPricingType, 10) : (dto.parkingPricingType || 1);
      
      if (parkingPricingType === 1) {
        // Fixed Amount - show parkingDailyRate
        if (dto.parkingDailyRate) {
          const rate = typeof dto.parkingDailyRate === 'string' ? parseFloat(dto.parkingDailyRate) : dto.parkingDailyRate;
          if (rate > 0) {
            parkingPricing = `${rate.toFixed(2)} SAR`;
          }
        }
      } else if (parkingPricingType === 2) {
        // Hourly Rate - show parkingHourlyRate
        if (dto.parkingHourlyRate) {
          const hourly = typeof dto.parkingHourlyRate === 'string' ? parseFloat(dto.parkingHourlyRate) : dto.parkingHourlyRate;
          if (hourly > 0) {
            parkingPricing = `${hourly.toFixed(2)} SAR/hr`;
          }
        }
      } else if (parkingPricingType === 3) {
        // Daily Max Rate - show dailyMaxRate if available
        if (dto.parkingDailyRate) {
          const maxRate = typeof dto.parkingDailyRate === 'string' ? parseFloat(dto.parkingDailyRate) : dto.parkingDailyRate;
          if (maxRate > 0) {
            parkingPricing = `Max ${maxRate.toFixed(2)} SAR/day`;
          }
        }
      }
    }

    // Format free minutes
    let freeMinutes = '0 minutes';
    if (dto.freeHours) {
      if (typeof dto.freeHours === 'string') {
        // If it's already a string, check if it contains "hours" or "minutes"
        const lowerStr = dto.freeHours.toLowerCase();
        if (lowerStr.includes('hour')) {
          // Extract number and convert hours to minutes
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
        // If it's a number, assume it's hours and convert to minutes
        const minutes = Math.round(dto.freeHours * 60);
        freeMinutes = `${minutes} minutes`;
      }
    } else if (dto.parkingFreeHours) {
      if (typeof dto.parkingFreeHours === 'string') {
        const lowerStr = dto.parkingFreeHours.toLowerCase();
        if (lowerStr.includes('hour')) {
          const numMatch = dto.parkingFreeHours.match(/\d+/);
          if (numMatch) {
            const hours = parseFloat(numMatch[0]);
            const minutes = Math.round(hours * 60);
            freeMinutes = `${minutes} minutes`;
          } else {
            freeMinutes = dto.parkingFreeHours.replace(/hours?/gi, 'minutes');
          }
        } else {
          freeMinutes = dto.parkingFreeHours;
        }
      } else {
        const minutes = Math.round(dto.parkingFreeHours * 60);
        freeMinutes = `${minutes} minutes`;
      }
    }

    // Format days from weekDayPricings
    const dayNames = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    let days = 'All Days';
    if (dto.weekDayPricings && dto.weekDayPricings.length > 0) {
      const dayValues = dto.weekDayPricings.map(wdp => wdp.dayOfWeek).sort((a, b) => a - b);
      days = dayValues.map(d => dayNames[d]).join(', ');
    }

    return {
      id: dto.id || 0,
      customerType: customerTypeMap[dto.customerType || 1] || String(dto.customerType || 'Unknown'),
      pricingType: pricingTypeMap[dto.pricingType || 1] || String(dto.pricingType || 'Unknown'),
      valetPricing: valetPricing,
      parkingPricing: parkingPricing,
      freeMinutes: freeMinutes,
      days: days
    };
  }

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

  onMenuClick(row: PricingRow, index: number, event: Event) {
    event.stopPropagation();
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  onMenuItemClick(row: PricingRow, action: string) {
    this.openMenuIndex = null;
    this.menuClick.emit({ row, action });
  }

  onEditClick(row: PricingRow, event: Event) {
    event.stopPropagation();
    this.menuClick.emit({ row, action: 'edit' });
  }

  onDeleteClick(row: PricingRow, event: Event) {
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
    this.pricingsService.deletePricing(this.pricingToDelete.id).subscribe({
      next: (response) => {
        console.log('Pricing deleted successfully', response);
        this.isDeleting = false;
        this.showDeleteConfirm = false;
        this.pricingToDelete = null;
        // Reload the pricing list
        this.reload();
      },
      error: (error) => {
        console.error('Failed to delete pricing', error);
        this.isDeleting = false;
        this.showDeleteConfirm = false;
        this.pricingToDelete = null;
        // Show error message
        this.loadError = 'Failed to delete pricing. Please try again.';
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-btn') && !target.closest('.menu-dropdown')) {
      this.openMenuIndex = null;
    }
  }

  onExport() {
    this.exportClick.emit();
  }

  onAddPricing() {
    this.addPricingClick.emit();
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadPricings();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPricings();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPricings();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Public method to reload data (e.g., after creating new pricing)
  reload() {
    this.currentPage = 1;
    this.loadPricings();
  }

  // Drag and drop methods
  onDragStart(event: DragEvent, index: number) {
    // Don't start drag if clicking on menu button or drag handle
    const target = event.target as HTMLElement;
    if (target.closest('.menu-btn') || target.closest('.menu-dropdown')) {
      event.preventDefault();
      return;
    }

    this.draggedRowIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', String(index));
    }
    
    // Set opacity on the row, not the target
    const row = target.closest('tr');
    if (row) {
      (row as HTMLElement).style.opacity = '0.5';
    }
  }

  onDragEnd(event: DragEvent) {
    // Reset opacity on all rows
    const target = event.target as HTMLElement;
    const row = target.closest('tr');
    if (row) {
      (row as HTMLElement).style.opacity = '1';
    }
    this.draggedRowIndex = null;
    this.dragOverRowIndex = null;
  }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (this.draggedRowIndex !== null && this.draggedRowIndex !== index) {
      this.dragOverRowIndex = index;
    }
  }

  onDragLeave(event: DragEvent) {
    this.dragOverRowIndex = null;
  }

  onDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    this.dragOverRowIndex = null;

    if (this.draggedRowIndex === null || this.draggedRowIndex === dropIndex) {
      this.draggedRowIndex = null;
      return;
    }

    // Reorder the array
    const draggedItem = this.pricingData[this.draggedRowIndex];
    const newData = [...this.pricingData];
    
    // Remove the dragged item
    newData.splice(this.draggedRowIndex, 1);
    
    // Insert at the new position
    newData.splice(dropIndex, 0, draggedItem);
    
    // Update the data
    this.pricingData = newData;
    this.draggedRowIndex = null;

    // Save the new order to backend
    this.saveReorderedPricings();
  }

  private saveReorderedPricings() {
    if (!this.siteId) {
      console.error('Site ID is required to reorder pricings');
      return;
    }

    // Build the reorder payload
    const reOrderPricingDtos = this.pricingData.map((row, index) => ({
      order: (index + 1) * 100, // Order values: 100, 200, 300, etc.
      id: row.id
    }));

    const payload: ReorderPricingsPayload = {
      siteId: this.siteId,
      reOrderPricingDtos: reOrderPricingDtos
    };

    console.log('Reordering pricings with payload:', payload);

    this.pricingsService.reorderPricings(payload).subscribe({
      next: (response) => {
        console.log('Pricings reordered successfully', response);
        if (response?.isSuccess === false) {
          console.error('Failed to reorder pricings:', response.message);
          // Optionally reload to restore original order
          // this.loadPricings();
        }
      },
      error: (error) => {
        console.error('Failed to reorder pricings', error);
        // Optionally reload to restore original order on error
        // this.loadPricings();
      }
    });
  }
}

