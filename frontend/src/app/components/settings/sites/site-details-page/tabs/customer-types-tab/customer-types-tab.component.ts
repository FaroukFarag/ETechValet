import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges, HostListener, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerTypesService, CustomerTypeDto } from '../../../../../../services/customer-types.service';

export interface CustomerTypeRow {
  id: number;
  name: string;
  code: string;
  description: string;
  totalCustomers: string;
  status: string;
  updatedAt: string;
}

@Component({
  selector: 'app-customer-types-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-types-tab.component.html',
  styleUrls: ['./customer-types-tab.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CustomerTypesTabComponent implements OnInit, OnChanges {
  @Input() siteId: number | null = null;

  customerTypes: CustomerTypeRow[] = [];
  isLoading = false;
  loadError: string | null = null;
  openMenuIndex: number | null = null;
  showEditDrawer = false;
  showDeleteConfirm = false;
  isSaving = false;
  isDeleting = false;
  editingCustomerType: CustomerTypeRow | null = null;
  pendingDeleteCustomerType: CustomerTypeRow | null = null;
  editForm: FormGroup;
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private customerTypesService: CustomerTypesService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.siteId) {
      this.loadCustomerTypes();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['siteId'] && !changes['siteId'].firstChange && this.siteId) {
      this.loadCustomerTypes();
    }
  }

  loadCustomerTypes(): void {
    if (!this.siteId) {
      this.customerTypes = [];
      return;
    }

    this.isLoading = true;
    this.loadError = null;

    this.customerTypesService
      .getPaginatedCustomerTypes({
        pageNumber: 1,
        pageSize: 50
      })
      .subscribe({
        next: (response) => {
          const allTypes = response?.data ?? [];
          const filtered = this.filterBySite(allTypes, this.siteId!);
          this.customerTypes = filtered.map((dto) => this.mapDtoToRow(dto));
          this.isLoading = false;
        },
      error: (error) => {
        console.error('Failed to load customer types', error);
        this.loadError = 'Failed to load customer types. Please try again.';
        this.customerTypes = [];
        this.isLoading = false;
      }
      });
  }

  reload(): void {
    this.loadCustomerTypes();
  }

  private filterBySite(customerTypes: CustomerTypeDto[], siteId: number): CustomerTypeDto[] {
    return customerTypes.filter((type) => {
      if (type.siteId === undefined || type.siteId === null) {
        return true;
      }
      const normalizedSiteId = typeof type.siteId === 'string' ? parseInt(type.siteId, 10) : type.siteId;
      return normalizedSiteId === siteId;
    });
  }

  private mapDtoToRow(dto: CustomerTypeDto): CustomerTypeRow {
    return {
      id: dto.id ?? 0,
      name: dto.name || 'Unnamed Type',
      code: dto.code || '—',
      description: dto.description || 'No description provided',
      totalCustomers: this.formatCount(dto.totalCustomers),
      status: this.mapStatus(dto.status),
      updatedAt: this.formatDate(dto.updatedAt || dto.createdAt)
    };
  }

  private mapStatus(status: string | number | undefined): string {
    if (status === null || status === undefined) {
      return 'Inactive';
    }
    if (typeof status === 'string') {
      const normalized = status.toLowerCase();
      if (normalized === '1' || normalized === 'active') {
        return 'Active';
      }
      if (normalized === '2' || normalized === 'inactive') {
        return 'Inactive';
      }
      return status;
    }
    return status === 1 ? 'Active' : 'Inactive';
  }

  private formatCount(value: number | string | undefined): string {
    if (value === null || value === undefined) {
      return '0';
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? value : parsed.toLocaleString();
  }

  private formatDate(value: string | undefined): string {
    if (!value) {
      return '—';
    }
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return value;
      }
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return value;
    }
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    const normalized = status.toLowerCase();
    if (normalized === 'active') return 'active';
    if (normalized === 'inactive') return 'inactive';
    return '';
  }

  trackByCustomerType(index: number, row: CustomerTypeRow): number {
    return row?.id ?? index;
  }

  toggleMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.openMenuIndex = null;
  }

  editCustomerType(row: CustomerTypeRow, event?: Event): void {
    event?.stopPropagation();
    this.openMenuIndex = null;
    this.editingCustomerType = row;
    this.editForm.patchValue({ name: row.name });
    this.showEditDrawer = true;
    this.lockBodyScroll();
  }

  deleteCustomerType(row: CustomerTypeRow, event?: Event): void {
    event?.stopPropagation();
    this.openMenuIndex = null;
    this.pendingDeleteCustomerType = row;
    this.showDeleteConfirm = true;
  }

  closeEditDrawer(): void {
    if (this.isSaving) return;
    this.showEditDrawer = false;
    this.editingCustomerType = null;
    this.editForm.reset();
    this.unlockBodyScroll();
  }

  submitEdit(): void {
    if (this.editForm.invalid || !this.editingCustomerType || !this.siteId) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const payload = {
      id: this.editingCustomerType.id,
      name: this.editForm.value.name,
      siteId: this.siteId
    };

    this.customerTypesService.updateCustomerType(payload).subscribe({
      next: (response) => {
        console.log('Customer type updated', response);
        this.isSaving = false;
        this.showEditDrawer = false;
        this.editingCustomerType = null;
        this.editForm.reset();
        this.unlockBodyScroll();
        this.loadCustomerTypes();
      },
      error: (error) => {
        console.error('Failed to update customer type', error);
        this.isSaving = false;
      }
    });
  }

  confirmDelete(): void {
    if (!this.pendingDeleteCustomerType?.id || this.isDeleting) {
      return;
    }

    const id = this.pendingDeleteCustomerType.id;
    this.isDeleting = true;

    this.customerTypesService.deleteCustomerType(id).subscribe({
      next: (response) => {
        console.log('Customer type deleted', response);
        this.isDeleting = false;
        this.showDeleteConfirm = false;
        this.pendingDeleteCustomerType = null;
        this.loadCustomerTypes();
        this.showNotification('Customer type deleted successfully', 'success');
      },
      error: (error) => {
        console.error('Failed to delete customer type', error);
        this.isDeleting = false;
        this.showNotification('Failed to delete customer type. Please try again.', 'error');
      }
    });
  }

  cancelDelete(): void {
    if (this.isDeleting) return;
    this.showDeleteConfirm = false;
    this.pendingDeleteCustomerType = null;
  }

  private lockBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScroll(): void {
    document.body.style.overflow = '';
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;

    setTimeout(() => {
      this.notificationMessage = null;
    }, 3000);
  }
}


