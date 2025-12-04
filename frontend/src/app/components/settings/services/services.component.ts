import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServicesService, ServiceDto } from '../../../services/services.service';

type ServiceStatus = 'Active' | 'Inactive' | 'Unknown';
type StatusOption = { label: Exclude<ServiceStatus, 'Unknown'>; value: number };

type ServiceRow = {
  dto: ServiceDto;
  id: number;
  name: string;
  description: string;
  status: ServiceStatus;
};

@Component({
  selector: 'app-settings-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  services: ServiceRow[] = [];
  isLoading = false;
  loadError: string | null = null;
  showDrawer = false;
  isSaving = false;
  serviceForm: FormGroup;
  openMenuIndex: number | null = null;
  editingService: ServiceRow | null = null;
  showDeleteConfirm = false;
  pendingDeleteService: ServiceRow | null = null;

  statusOptions: StatusOption[] = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 2 }
  ];

  constructor(
    private servicesService: ServicesService,
    private fb: FormBuilder
  ) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      status: [1, Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchServices();
  }

  getStatusClass(status: ServiceStatus): string {
    if (status === 'Active') return 'active';
    if (status === 'Inactive') return 'inactive';
    return 'unknown';
  }

  fetchServices(): void {
    this.isLoading = true;
    this.loadError = null;
    this.openMenuIndex = null;

    this.servicesService.getAllServices().subscribe({
      next: (data) => {
        this.services = (data ?? []).map(this.mapDtoToRow);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load services', error);
        this.loadError = 'Failed to load services. Please try again.';
        this.services = [];
        this.isLoading = false;
      }
    });
  }

  openAddService(): void {
    this.showDrawer = true;
    this.editingService = null;
    this.serviceForm.reset({
      name: '',
      description: '',
      status: 1
    });
  }

  closeDrawer(): void {
    if (this.isSaving) return;
    this.showDrawer = false;
    this.editingService = null;
  }

  submitService(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const payload = {
      id: this.editingService?.id ?? 0,
      name: this.serviceForm.value.name,
      description: this.serviceForm.value.description,
      status: Number(this.serviceForm.value.status)
    };

    const request$ = this.editingService
      ? this.servicesService.updateService(payload)
      : this.servicesService.createService(payload);

    request$.subscribe({
      next: (response) => {
        console.log(this.editingService ? 'Service updated' : 'Service created', response);
        this.isSaving = false;
        this.showDrawer = false;
        this.editingService = null;
        this.fetchServices();
      },
      error: (error) => {
        console.error(this.editingService ? 'Failed to update service' : 'Failed to create service', error);
        this.isSaving = false;
      }
    });
  }

  toggleMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  editService(row: ServiceRow, event?: Event): void {
    event?.stopPropagation();
    this.openMenuIndex = null;
    this.editingService = row;
    this.serviceForm.patchValue({
      name: row.name,
      description: row.description,
      status: this.mapStatusToValue(row.dto.status ?? row.status) ?? 1
    });
    this.showDrawer = true;
  }

  deleteService(row: ServiceRow, event?: Event): void {
    event?.stopPropagation();
    this.openMenuIndex = null;
    this.pendingDeleteService = row;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteService?.id) {
      this.cancelDelete();
      return;
    }

    const serviceId = this.pendingDeleteService.id;
    this.showDeleteConfirm = false;
    this.pendingDeleteService = null;
    this.isLoading = true;

    this.servicesService.deleteService(serviceId).subscribe({
      next: (response) => {
        console.log('Service deleted', response);
        this.fetchServices();
      },
      error: (error) => {
        console.error('Failed to delete service', error);
        this.isLoading = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.pendingDeleteService = null;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openMenuIndex = null;
  }

  private mapDtoToRow = (dto: ServiceDto): ServiceRow => {
    const statusLabel = this.mapStatusToLabel(dto.status);

    return {
      dto,
      id: dto.id ?? 0,
      name: dto.name ?? dto.serviceName ?? dto.title ?? '—',
      description: dto.description ?? dto.serviceDescription ?? '—',
      status: statusLabel
    };
  };

  private mapStatusToLabel(status: unknown): ServiceStatus {
    if (typeof status === 'number') {
      if (status === 1) return 'Active';
      if (status === 2) return 'Inactive';
    } else if (typeof status === 'string') {
      const trimmed = status.trim();
      const numericValue = Number(trimmed);
      if (!Number.isNaN(numericValue)) {
        if (numericValue === 1) return 'Active';
        if (numericValue === 2) return 'Inactive';
      } else {
        const normalized = trimmed.toLowerCase();
        if (normalized === 'active') return 'Active';
        if (normalized === 'inactive') return 'Inactive';
      }
    }

    return 'Unknown';
  }

  private mapStatusToValue(status: unknown): number | null {
    if (typeof status === 'number') {
      if (status === 1 || status === 2) {
        return status;
      }
      return null;
    }

    if (typeof status === 'string') {
      const trimmed = status.trim();
      const numericValue = Number(trimmed);
      if (!Number.isNaN(numericValue) && (numericValue === 1 || numericValue === 2)) {
        return numericValue;
      }

      const normalized = trimmed.toLowerCase();
      if (normalized === 'active') {
        return 1;
      }
      if (normalized === 'inactive') {
        return 2;
      }
    }

    return null;
  }
}
