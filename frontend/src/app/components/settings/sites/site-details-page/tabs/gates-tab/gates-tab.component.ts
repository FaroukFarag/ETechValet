import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GatesService } from '../../../../../../services/gates.service';
import { GatesGridComponent, Gate } from './gates-grid/gates-grid.component';

@Component({
  selector: 'app-gates-tab',
  standalone: true,
  imports: [CommonModule, GatesGridComponent],
  templateUrl: './gates-tab.component.html',
  styleUrls: ['./gates-tab.component.scss']
})
export class GatesTabComponent implements OnInit {
  @Input() siteId: number | null = null;
  @Output() gateAdded = new EventEmitter<void>();

  gates: Gate[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalCount = 0;

  constructor(private gatesService: GatesService) {}

  ngOnInit() {
    if (this.siteId) {
      this.loadGates();
    }
  }

  // Public method so parent component can trigger reload
  public loadGates() {
    if (!this.siteId) return;

    this.isLoading = true;
    this.gatesService.getPaginatedGates({
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (response) => {
        // Filter gates for the current site
        const allGates = response.data || [];
        const siteGates = allGates.filter(gate => gate.siteId === this.siteId);
        
        this.gates = siteGates.map(dto => ({
          id: dto.id || 0,
          name: dto.name || dto.gateName || '',
          status: this.mapGateStatus(dto.status)
        }));
        
        // Update pagination info
        // Note: If backend supports siteId filtering, use response.totalCount directly
        // For now, we're filtering on frontend, so we need to recalculate
        // In a real scenario, you'd want to send siteId to the backend
        this.totalCount = siteGates.length;
        this.totalPages = response.totalPages || Math.ceil(this.totalCount / this.pageSize);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load gates', error);
        this.gates = [];
        this.totalCount = 0;
        this.totalPages = 0;
        this.isLoading = false;
      }
    });
  }

  private mapGateStatus(status: any): 'Active' | 'Inactive' {
    if (typeof status === 'number') {
      return status === 1 ? 'Active' : 'Inactive';
    }
    if (typeof status === 'string') {
      const normalized = status.toLowerCase();
      if (normalized === '1' || normalized === 'active') {
        return 'Active';
      }
    }
    return 'Inactive';
  }

  onGateMenu(gate: Gate) {
    console.log('Menu clicked for gate:', gate);
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadGates();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadGates();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadGates();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}

