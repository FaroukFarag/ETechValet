import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickupRequestsService, PickupRequestDto } from '../../services/pickup-requests.service';
import { ShiftsService, ShiftDto } from '../../services/shifts.service';
import { ReportsService, ShiftSalesReportDto } from '../../services/reports.service';

interface ReportRow {
  siteName: string;
  requestNo: string;
  createdTime: string;
  plateNumber: string;
  gate: string;
  customerMobile: string;
  receiver: string;
  parkedBy: string;
  deliveredBy: string;
  carWash: 'Yes' | 'No' | 'Completed';
  amount: string;
  paymentType: 'Cash' | 'Online' | 'Free';
  notes: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  shiftDate: string = '';
  shiftType: string = '';
  dateFrom: string = '';
  dateTo: string = '';
  
  reports: ReportRow[] = [];
  isLoading = false;
  loadError: string | null = null;
  
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  shiftOptions: ShiftDto[] = [];
  selectedShiftId: number | null = null;
  selectedReportType: 'shift-sales' | 'date-sales' | 'driver-productivity' = 'shift-sales';
  reportType: 'by-shift' | 'by-date-range' = 'by-shift';
  activeTab: 'shift-sales' | 'date-sales' | 'driver-productivity' = 'shift-sales';

  constructor(
    private pickupRequestsService: PickupRequestsService,
    private shiftsService: ShiftsService,
    private reportsService: ReportsService
  ) {
    // Initialize dates as empty to load all reports by default
    // Dates are optional - if not provided, API returns all reports
    this.shiftDate = '';
    this.dateFrom = '';
    this.dateTo = '';
  }

  ngOnInit() {
    this.loadShifts();
    this.loadReports();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  onReportTypeChange() {
    this.currentPage = 1;
    this.loadReports();
  }

  setActiveTab(tab: 'shift-sales' | 'date-sales' | 'driver-productivity') {
    this.activeTab = tab;
    this.selectedReportType = tab;
    
    // Set reportType based on tab
    if (tab === 'shift-sales') {
      this.reportType = 'by-shift';
    } else if (tab === 'date-sales') {
      this.reportType = 'by-date-range';
    } else {
      this.reportType = 'by-date-range'; // driver productivity uses date range
    }
    
    this.currentPage = 1;
    this.loadReports();
  }

  setReportType(type: 'by-shift' | 'by-date-range') {
    this.reportType = type;
    // Map reportType to selectedReportType
    if (type === 'by-shift') {
      this.selectedReportType = 'shift-sales';
    } else if (type === 'by-date-range') {
      this.selectedReportType = 'date-sales';
    }
    this.currentPage = 1;
    this.loadReports();
  }

  onShiftDateChange() {
    this.currentPage = 1;
    if (this.selectedReportType === 'shift-sales') {
      this.loadShiftReports();
    } else {
      this.loadReports();
    }
  }

  onShiftTypeChange() {
    this.currentPage = 1;
    this.loadReports();
  }

  onDateFromChange() {
    this.currentPage = 1;
    this.loadReports();
  }

  onDateToChange() {
    this.currentPage = 1;
    this.loadReports();
  }

  exportData() {
    console.log('Export reports');
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
    const maxVisible = 7;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages - 1);
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push(2);
        pages.push('...');
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

  goToPage(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage = page;
    }
  }

  getCarWashClass(carWash: string): string {
    if (carWash === 'Yes' || carWash === 'Completed') return 'yes';
    return 'no';
  }

  getPaymentTypeClass(paymentType: string): string {
    return paymentType.toLowerCase();
  }

  private loadShifts() {
    this.shiftsService.getAllShifts().subscribe({
      next: (shifts) => {
        this.shiftOptions = shifts || [];
      },
      error: (error) => {
        console.error('Failed to load shifts', error);
      }
    });
  }

  private loadReports() {
    if (this.selectedReportType === 'shift-sales') {
      this.loadShiftReports();
    } else if (this.selectedReportType === 'date-sales') {
      this.loadDateSalesReports();
    } else if (this.selectedReportType === 'driver-productivity') {
      this.loadDriverProductivityReports();
    }
  }

  private loadShiftReports() {
    this.isLoading = true;
    this.loadError = null;
    
    // Convert shiftDate to ISO string format if provided
    // If shiftDate is empty, pass undefined to get all reports
    let shiftDateISO: string | undefined;
    
    if (this.shiftDate) {
      // If it's already in ISO format, use it; otherwise convert from YYYY-MM-DD
      if (this.shiftDate.includes('T')) {
        shiftDateISO = this.shiftDate;
      } else {
        // Create a date at midnight and convert to ISO
        const date = new Date(this.shiftDate + 'T00:00:00');
        shiftDateISO = date.toISOString();
      }
      console.log('Loading shift reports with date:', shiftDateISO);
    } else {
      console.log('Loading all shift reports (no date filter)');
    }
    
    this.reportsService.getShiftSalesReport(shiftDateISO).subscribe({
      next: (reports) => {
        console.log('Shift reports loaded:', reports);
        this.reports = (reports || []).map(this.mapShiftReportToRow);
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load shift reports', error);
        this.loadError = 'Failed to load shift reports. Please try again.';
        this.isLoading = false;
        this.reports = [];
        this.updatePagination();
      }
    });
  }

  private loadDateSalesReports() {
    this.isLoading = true;
    this.loadError = null;
    
    // Convert dates to ISO format if provided, otherwise pass undefined
    let startTimeISO: string | undefined;
    let endTimeISO: string | undefined;
    
    if (this.dateFrom) {
      const date = new Date(this.dateFrom + 'T00:00:00');
      startTimeISO = date.toISOString();
    }
    
    if (this.dateTo) {
      const date = new Date(this.dateTo + 'T23:59:59');
      endTimeISO = date.toISOString();
    }
    
    if (startTimeISO || endTimeISO) {
      console.log('Loading date sales reports with range:', startTimeISO, 'to', endTimeISO);
    } else {
      console.log('Loading all date sales reports (no date filter)');
    }
    
    this.reportsService.getDateSalesReport(startTimeISO, endTimeISO).subscribe({
      next: (reports) => {
        console.log('Date sales reports loaded:', reports);
        this.reports = (reports || []).map(this.mapShiftReportToRow);
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load date sales reports', error);
        this.loadError = 'Failed to load date sales reports. Please try again.';
        this.isLoading = false;
        this.reports = [];
        this.updatePagination();
      }
    });
  }

  private loadDriverProductivityReports() {
    this.isLoading = true;
    this.loadError = null;
    
    // Convert dates to ISO format if provided, otherwise pass undefined
    let startTimeISO: string | undefined;
    let endTimeISO: string | undefined;
    
    if (this.dateFrom) {
      const date = new Date(this.dateFrom + 'T00:00:00');
      startTimeISO = date.toISOString();
    }
    
    if (this.dateTo) {
      const date = new Date(this.dateTo + 'T23:59:59');
      endTimeISO = date.toISOString();
    }
    
    if (startTimeISO || endTimeISO) {
      console.log('Loading driver productivity reports with range:', startTimeISO, 'to', endTimeISO);
    } else {
      console.log('Loading all driver productivity reports (no date filter)');
    }
    
    this.reportsService.getDriverProductivityReport(startTimeISO, endTimeISO).subscribe({
      next: (reports) => {
        console.log('Driver productivity reports loaded:', reports);
        this.reports = (reports || []).map(this.mapDriverProductivityToRow);
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load driver productivity reports', error);
        this.loadError = 'Failed to load driver productivity reports. Please try again.';
        this.isLoading = false;
        this.reports = [];
        this.updatePagination();
      }
    });
  }

  private mapDriverProductivityToRow = (dto: any): ReportRow => ({
    siteName: dto.siteName || '—',
    requestNo: dto.requestNo || dto.requestNumber || dto.id?.toString() || '—',
    createdTime: this.formatDateTime(dto.startTime),
    plateNumber: dto.plateNumber || '—',
    gate: dto.gateName || '—',
    customerMobile: dto.customerMobileNumber || '—',
    receiver: dto.receivedByName || '—',
    parkedBy: dto.parkedByName || dto.driverName || '—',
    deliveredBy: dto.deliveredByName || '—',
    carWash: this.mapCarWashStatus(dto.carWashStatus),
    amount: this.formatAmount(dto.amount),
    paymentType: this.mapPaymentType(dto.paymentType),
    notes: dto.notes || '—'
  });

  private mapRequestToReportRow = (dto: PickupRequestDto): ReportRow => ({
    siteName: dto.siteName || '—',
    requestNo: dto.requestNumber || dto.id?.toString() || '—',
    createdTime: this.formatDateTime(dto.createdAt),
    plateNumber: dto.plateNumber || '—',
    gate: dto.gateName || '—',
    customerMobile: dto.customerMobileNumber || '—',
    receiver: dto['receivedByName'] || '—',
    parkedBy: dto['parkedByName'] || '—',
    deliveredBy: dto['deliveredByName'] || '—',
    carWash: this.mapCarWashStatus(dto['carWashStatus']),
    amount: this.formatAmount(dto.amount),
    paymentType: this.mapPaymentType(dto.paymentType),
    notes: dto['notes'] || '—'
  });

  private mapShiftReportToRow = (dto: ShiftSalesReportDto): ReportRow => ({
    siteName: dto.siteName || '—',
    requestNo: dto.requestNo || dto.requestNumber || dto.id?.toString() || '—',
    createdTime: this.formatDateTime(dto.startTime),
    plateNumber: dto.plateNumber || '—',
    gate: dto.gateName || '—',
    customerMobile: dto.customerMobileNumber || '—',
    receiver: dto.receivedByName || '—',
    parkedBy: dto.parkedByName || '—',
    deliveredBy: dto.deliveredByName || '—',
    carWash: this.mapCarWashStatus(dto.carWashStatus),
    amount: this.formatAmount(dto.amount),
    paymentType: this.mapPaymentType(dto.paymentType),
    notes: dto.notes || '—'
  });

  private formatDateTime(dateTime: string | undefined): string {
    if (!dateTime) return '—';
    try {
      const date = new Date(dateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch {
      return dateTime;
    }
  }

  private mapCarWashStatus(status: string | number | undefined): 'Yes' | 'No' | 'Completed' {
    if (status === undefined || status === null) return 'No';
    const normalized = typeof status === 'number' ? status.toString() : status.toLowerCase();
    if (normalized === 'completed' || normalized === '1') return 'Completed';
    if (normalized === 'yes' || normalized === '2') return 'Yes';
    return 'No';
  }

  private formatAmount(value: string | number | undefined): string {
    if (value === undefined || value === null) return '—';
    const numeric = typeof value === 'number' ? value : parseFloat(value);
    if (Number.isNaN(numeric)) return '—';
    return `${numeric} SAR`;
  }

  private mapPaymentType(value: string | number | undefined): 'Cash' | 'Online' | 'Free' {
    if (value === undefined || value === null) return 'Free';
    const normalized = typeof value === 'number' ? value.toString() : value.toLowerCase();
    if (normalized === '1' || normalized === 'cash') return 'Cash';
    if (normalized === '2' || normalized === 'online') return 'Online';
    return 'Free';
  }

  private updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.reports.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  get paginatedReports(): ReportRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.reports.slice(start, start + this.pageSize);
  }
}

