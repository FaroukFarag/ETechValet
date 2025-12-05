import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AddRequestComponent } from '../add-request/add-request.component';
import { PickupRequestsService, PickupRequestDto } from '../../services/pickup-requests.service';

type RequestTab = 'picked-up' | 'parked' | 'delivered';

interface RequestRow {
  requestNo: string;
  gateName: string;
  siteName: string;
  createdTime: string;
  plateNumber: string;
  customerMobile: string;
  cardNumber: string;
  customerType: string;
  paymentType: string;
  amount: string;
}

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, AddRequestComponent],
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
  activeTab: RequestTab = 'delivered';
  dateFrom = '';
  dateTo = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  showAddRequestModal = false;

  pickedRequests: RequestRow[] = [];
  parkedRequests: RequestRow[] = [];
  deliveredRequests: RequestRow[] = [];
  isLoading = false;
  loadError: string | null = null;

  constructor(
    private router: Router,
    private pickupRequestsService: PickupRequestsService
  ) {
    const today = new Date();
    this.dateTo = today.toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    this.dateFrom = weekAgo.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.loadRequests('picked-up');
    this.loadRequests('parked');
    this.loadRequests('delivered');
  }

  setActiveTab(tab: RequestTab) {
    this.activeTab = tab;
    this.currentPage = 1;
    this.updatePagination();
  }

  addRequest() {
    this.showAddRequestModal = true;
  }

  closeAddRequestModal() {
    this.showAddRequestModal = false;
    this.reloadActiveTab();
  }

  onDateFromChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dateFrom = input.value;
  }

  onDateToChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dateTo = input.value;
  }

  exportData() {
    console.log('Export requests');
  }

  get requests(): RequestRow[] {
    const data = this.getRequestsForActiveTab();
    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  openRequestDetails(request: RequestRow) {
    this.router.navigate(['/requests', request.requestNo]);
  }

  getRequestsForActiveTab(): RequestRow[] {
    if (this.activeTab === 'picked-up') return this.pickedRequests;
    if (this.activeTab === 'parked') return this.parkedRequests;
    return this.deliveredRequests;
  }

  private loadRequests(tab: RequestTab) {
    const statusMap: Record<RequestTab, number> = {
      'picked-up': 2,
      'parked': 3,
      'delivered': 4
    };
    const status = statusMap[tab];
    this.isLoading = true;
    this.pickupRequestsService.getRequestsByStatus(status).subscribe({
      next: (result) => {
        if (!result.isSuccess) {
          this.loadError = `Failed to load ${tab} requests`;
          this.isLoading = false;
          return;
        }

        const mapped = (result.data || []).map(this.mapRequestDtoToRow);
        if (tab === 'picked-up') this.pickedRequests = mapped;
        if (tab === 'parked') this.parkedRequests = mapped;
        if (tab === 'delivered') this.deliveredRequests = mapped;
        this.isLoading = false;
        this.updatePagination();
      },
      error: (error) => {
        console.error(`Failed to load ${tab} requests`, error);
        this.loadError = `Failed to load ${tab} requests`;
        this.isLoading = false;
      }
    });
  }

  private reloadActiveTab() {
    this.loadRequests(this.activeTab);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  handlePageClick(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage = page;
    }
  }

  openReceipts(request: RequestRow, event: Event) {
    event.stopPropagation();
    console.log('Open receipts', request.requestNo);
  }

  openImages(request: RequestRow, event: Event) {
    event.stopPropagation();
    console.log('Open images', request.requestNo);
  }

  getPaymentTypeClass(paymentType: string): string {
    return paymentType.toLowerCase();
  }

  private mapRequestDtoToRow = (dto: PickupRequestDto): RequestRow => ({
    requestNo: dto.requestNumber || dto.id?.toString() || '—',
    gateName: dto.gateName || '—',
    siteName: dto.siteName || '—',
    createdTime: dto.createdAt || '—',
    plateNumber: dto.plateNumber || '—',
    customerMobile: dto.customerMobileNumber || '—',
    cardNumber: dto.cardNumber || '—',
    customerType: dto.customerType || '—',
    paymentType: this.mapPaymentType(dto.paymentType),
    amount: this.formatAmount(dto.amount)
  });

  private mapPaymentType(value: string | number | undefined): string {
    if (value === undefined || value === null) return 'Unknown';
    const normalized = typeof value === 'number' ? value.toString() : value.toLowerCase();
    if (normalized === '1' || normalized === 'cash') return 'Cash';
    if (normalized === '2' || normalized === 'online') return 'Online';
    return typeof value === 'string' ? value : 'Unknown';
  }

  private formatAmount(value: string | number | undefined): string {
    if (value === undefined || value === null) return '—';
    const numeric = typeof value === 'number' ? value : parseFloat(value);
    if (Number.isNaN(numeric)) return '—';
    return `${numeric} SAR`;
  }

  private updatePagination() {
    const dataLength = this.getRequestsForActiveTab().length;
    this.totalPages = Math.max(1, Math.ceil(dataLength / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }
}
