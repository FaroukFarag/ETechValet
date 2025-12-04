import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SitesService, SiteDto, CreateSitePayload, PaginatedSitesResponse } from '../../../services/sites.service';
import { CompaniesService, CompanyDto } from '../../../services/companies.service';

type Status = 'Active' | 'Inactive';

type SiteRow = {
  dto: SiteDto;
  id: number;
  siteName: string;
  companyName: string;
  companyId?: number;
  valueType?: string | number;
  fixedValueDisplay: string;
  percentageDisplay: string;
  fixedValueRaw?: number | string;
  percentageRaw?: number | string;
  city: string;
  address: string;
  status: Status;
};


@Component({
  selector: 'app-settings-sites',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sites.component.html',
  styleUrls: ['./sites.component.scss']
})
export class SitesComponent implements OnInit {
  sites: SiteRow[] = [];

  isLoading = false;
  loadError: string | null = null;
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' = 'success';

  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalCount = 0;

  showDeleteConfirm = false;
  pendingDeleteSite: SiteRow | null = null;

  openSiteMenuIndex: number | null = null;

  showAddSiteDrawer = false;
  isSaving = false;
  enableExtraServices = false;
  isEditMode = false;
  editingSite: SiteRow | null = null;

  addSiteForm: FormGroup;
  companyOptions: { id: number; label: string }[] = [];
  showFixedValueField = true;
  showPercentageField = true;
  readonly defaultExtraServices = ['Service one', 'Service two', 'Service three', 'Service four'];

  valueTypes = [
    { value: 0, label: 'Fixed' },
    { value: 2, label: 'Percentage' },
    { value: 1, label: 'Both' }
  ];
  statusOptions = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 2 }
  ];

  constructor(
    private fb: FormBuilder,
    private sitesService: SitesService,
    private companiesService: CompaniesService,
    private router: Router
  ) {
    this.addSiteForm = this.fb.group({
      siteName: ['', Validators.required],
      companyId: [null, Validators.required],
      valueType: [1, Validators.required],
      fixedValue: [''],
      percentage: [''],
      address: ['', Validators.required],
      status: [1, Validators.required],
      extraServices: this.fb.array(this.defaultExtraServices.map(label => this.createExtraServiceGroup(label)))
    });

    const valueTypeControl = this.addSiteForm.get('valueType');
    if (valueTypeControl) {
      valueTypeControl.valueChanges.subscribe(value => {
        this.updateValueTypeControls(Number(value));
      });
      this.updateValueTypeControls(Number(valueTypeControl.value ?? 1));
    }
  }

  ngOnInit(): void {
    // Load companies first, then load sites so company names are available
    this.loadCompaniesAndSites();
  }

  private loadCompaniesAndSites(): void {
    this.companiesService.getAllCompanies().subscribe({
      next: (companies: CompanyDto[]) => {
        this.companyOptions = companies.map(company => ({
          id: company.id ?? 0,
          label: company.name ?? company.shortName ?? 'Unnamed Company'
        }));
        // Now load sites after companies are loaded
        this.loadSites();
      },
      error: (error) => {
        console.error('Failed to load companies for dropdown', error);
        this.companyOptions = [];
        // Still load sites even if companies fail
        this.loadSites();
      }
    });
  }

  get extraServicesArray(): FormArray {
    return this.addSiteForm.get('extraServices') as FormArray;
  }

  exportCurrentTab(): void {
    console.log('Exporting sites data');
  }

  getStatusClass(status: Status): string {
    return status.toLowerCase();
  }

  openAddSite(): void {
    this.showAddSiteDrawer = true;
    this.enableExtraServices = false;
    this.isEditMode = false;
    this.editingSite = null;
    this.addSiteForm.reset({
      siteName: '',
      companyId: null,
      valueType: 1,
      fixedValue: null,
      percentage: null,
      address: '',
      status: 1
    });
    this.loadExtraServicesFromLabels(this.defaultExtraServices);
    // Use setTimeout to ensure form is reset before updating validators
    setTimeout(() => {
      this.updateValueTypeControls(1);
    }, 0);
  }

  closeAddSite(): void {
    if (this.isSaving) return;
    this.showAddSiteDrawer = false;
  }

  toggleExtraServices(value: boolean): void {
    this.enableExtraServices = value;

    if (!value) {
      this.extraServicesArray.controls.forEach(control => {
        control.get('enabled')?.setValue(false);
        control.get('amount')?.reset('');
      });
      return;
    }

    if (this.extraServicesArray.length === 0) {
      this.loadExtraServicesFromLabels(this.defaultExtraServices, true);
      return;
    }

    if (!this.extraServicesArray.controls.some(control => control.get('enabled')?.value)) {
      this.extraServicesArray.at(0).get('enabled')?.setValue(true);
    }
  }

  submitAddSite(): void {
    if (this.isSaving) return;

    if (this.addSiteForm.invalid) {
      this.addSiteForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const formValue = this.addSiteForm.value;

    const payload: CreateSitePayload = {
      id: this.isEditMode && this.editingSite?.id ? this.editingSite.id : 0,
      name: formValue.siteName,
      companyId: Number(formValue.companyId),
      valueType: Number(formValue.valueType),
      fixedValue: Number(formValue.fixedValue) || 0,
      percentage: String(Number(formValue.percentage) || 0),
      address: formValue.address,
      status: Number(formValue.status)
    };

    if (this.enableExtraServices) {
      payload.extraServices = this.extraServicesArray.controls.map((control, index) => ({
        label: control.get('label')?.value || this.defaultExtraServices[index] || '',
        enabled: !!control.get('enabled')?.value,
        amount: control.get('amount')?.value ?? ''
      }));
    }

    const request$ = this.isEditMode
      ? this.sitesService.updateSite(payload)
      : this.sitesService.createSite(payload);

    request$.subscribe({
      next: (response) => {
        console.log(this.isEditMode ? 'Site updated' : 'Site created', response);
        this.isSaving = false;
        this.showAddSiteDrawer = false;
        this.editingSite = null;
        this.isEditMode = false;
        this.loadSites();
      },
      error: (error) => {
        console.error(this.isEditMode ? 'Failed to update site' : 'Failed to create site', error);
        this.isSaving = false;
      }
    });
  }

  private createExtraServiceGroup(label: string = '', enabled = false, amount: string | number = ''): FormGroup {
    return this.fb.group({
      label: [label],
      enabled: [enabled],
      amount: [amount]
    });
  }

  private loadExtraServicesFromLabels(labels: string[], enableFirst = false): void {
    const resolvedLabels = [...labels];
    if (resolvedLabels.length < this.defaultExtraServices.length) {
      resolvedLabels.push(...this.defaultExtraServices.slice(resolvedLabels.length));
    }

    this.extraServicesArray.clear();
    resolvedLabels.forEach((label, index) => {
      this.extraServicesArray.push(this.createExtraServiceGroup(label, enableFirst ? index === 0 : false, ''));
    });
  }

  private loadExtraServicesFromDto(extraServices: Array<{ label?: string; enabled?: boolean; amount?: string | number }>): void {
    const normalized = [...extraServices];
    if (normalized.length < this.defaultExtraServices.length) {
      for (let i = normalized.length; i < this.defaultExtraServices.length; i++) {
        normalized.push({
          label: this.defaultExtraServices[i],
          enabled: false,
          amount: ''
        });
      }
    }

    this.extraServicesArray.clear();
    normalized.forEach((service, index) => {
      const fallbackLabel = this.defaultExtraServices[index] ?? service?.label ?? `Service ${index + 1}`;
      this.extraServicesArray.push(
        this.createExtraServiceGroup(
          service?.label ?? fallbackLabel,
          !!service?.enabled,
          service?.amount ?? ''
        )
      );
    });
  }


  private updateValueTypeControls(valueType: number): void {
    const fixedControl = this.addSiteForm.get('fixedValue');
    const percentageControl = this.addSiteForm.get('percentage');

    if (!fixedControl || !percentageControl) {
      return;
    }

    this.showFixedValueField = valueType === 0 || valueType === 1;
    this.showPercentageField = valueType === 1 || valueType === 2;

    if (this.showFixedValueField) {
      fixedControl.setValidators([Validators.required]);
    } else {
      fixedControl.clearValidators();
      fixedControl.setValue(null);
    }

    if (this.showPercentageField) {
      percentageControl.setValidators([Validators.required]);
    } else {
      percentageControl.clearValidators();
      percentageControl.setValue(null);
    }

    fixedControl.updateValueAndValidity({ emitEvent: true });
    percentageControl.updateValueAndValidity({ emitEvent: true });
    
    // Force form to update its validity state
    this.addSiteForm.updateValueAndValidity({ emitEvent: false });
  }


  loadSites(): void {
    this.isLoading = true;
    this.loadError = null;

    const paginationPayload = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    this.sitesService.getPaginatedSites(paginationPayload).subscribe({
      next: (response: PaginatedSitesResponse) => {
        this.sites = response.data.map(this.mapSiteDtoToRow);
        this.totalCount = response.totalCount ?? 0;
        this.totalPages = response.totalPages ?? Math.ceil(this.totalCount / this.pageSize);
        this.isLoading = false;
        this.openSiteMenuIndex = null;
      },
      error: (error) => {
        console.error('Failed to load sites', error);
        this.loadError = 'Failed to load sites. Please try again.';
        this.sites = [];
        this.totalCount = 0;
        this.totalPages = 0;
        this.isLoading = false;
      }
    });
  }

  private mapSiteDtoToRow = (dto: SiteDto): SiteRow => {
    // Look up company name from companyId
    const company = this.companyOptions.find(c => c.id === dto.companyId);
    const companyName = dto.companyName ?? company?.label ?? '';

    return {
      dto,
      id: dto.id ?? 0,
      siteName: dto.siteName ?? dto.name ?? '',
      companyName,
      companyId: dto.companyId,
      valueType: dto.valueType,
      fixedValueDisplay: this.formatFixedValue(dto.fixedValue, dto.valueType),
      percentageDisplay: this.formatPercentage(dto.percentage, dto.valueType),
      fixedValueRaw: dto.fixedValue,
      percentageRaw: dto.percentage,
      city: dto.city ?? '-',
      address: dto.address ?? '-',
      status: this.mapStatusToLabel(dto.status)
    };
  };

  private formatFixedValue(value: SiteDto['fixedValue'], valueType?: string | number): string {
    if (value == null || value === '' || value === 'None') {
      const typeLabel = this.getValueTypeLabel(valueType);
      return typeLabel === 'Both' || typeLabel === 'Fixed' ? '0 SAR' : 'None';
    }

    let numericValue: number | null = null;

    if (typeof value === 'string') {
      const normalized = value.replace(/[^0-9.-]/g, '');
      if (normalized) {
        const parsed = Number(normalized);
        if (!isNaN(parsed)) {
          numericValue = parsed;
        }
      }
      if (numericValue === null) {
        return value.includes('SAR') ? value : `${value} SAR`;
      }
    } else {
      numericValue = value;
    }

    return `${numericValue.toLocaleString()} SAR`;
  }

  private formatPercentage(value: SiteDto['percentage'], valueType?: string | number): string {
    if (value == null || value === '' || value === 'None') {
      const typeLabel = this.getValueTypeLabel(valueType);
      return typeLabel === 'Both' || typeLabel === 'Percentage' ? '0%' : 'None';
    }

    let numericValue: number | null = null;

    if (typeof value === 'string') {
      const normalized = value.replace(/[^0-9.-]/g, '');
      if (normalized) {
        const parsed = Number(normalized);
        if (!isNaN(parsed)) {
          numericValue = parsed;
        }
      }
      if (numericValue === null) {
        return value.includes('%') ? value : `${value}%`;
      }
    } else {
      numericValue = value;
    }

    return `${numericValue}%`;
  }

  private getValueTypeLabel(valueType?: string | number): string {
    if (valueType == null) {
      return '';
    }

    if (typeof valueType === 'string') {
      return valueType;
    }

    const match = this.valueTypes.find(option => option.value === valueType);
    return match ? match.label : '';
  }

  private mapStatusToLabel(status: any): Status {
    if (typeof status === 'number') {
      return status === 1 ? 'Active' : 'Inactive';
    }
    if (typeof status === 'string') {
      const normalized = status.toLowerCase();
      if (normalized === '1' || normalized === 'active') {
        return 'Active';
      }
      if (normalized === '2' || normalized === 'inactive') {
        return 'Inactive';
      }
    }
    return 'Inactive';
  }

  private resolveValueType(valueType?: string | number): number {
    if (typeof valueType === 'number') {
      return valueType;
    }

    if (typeof valueType === 'string') {
      const match = this.valueTypes.find(option => option.label.toLowerCase() === valueType.toLowerCase());
      if (match) {
        return match.value;
      }
    }

    return 1; // default Both
  }

  private getFixedValueInput(value: SiteDto['fixedValue']): string {
    if (value == null || value === '') {
      return '';
    }

    if (typeof value === 'number') {
      return String(value);
    }

    const normalized = value.replace(/[^0-9.-]/g, '');
    return normalized;
  }

  private getPercentageInput(value: SiteDto['percentage']): string {
    if (value == null || value === '') {
      return '';
    }

    if (typeof value === 'number') {
      return String(value);
    }

    const normalized = value.replace(/[^0-9.-]/g, '');
    return normalized;
  }

  toggleActionsMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.openSiteMenuIndex = this.openSiteMenuIndex === index ? null : index;
  }

  editSite(row: SiteRow, event?: Event): void {
    event?.stopPropagation();
    this.openSiteMenuIndex = null;

    this.showAddSiteDrawer = true;
    this.isEditMode = true;
    this.editingSite = row;
    this.enableExtraServices = false;

    const dto = row.dto;
    const valueType = this.resolveValueType(dto.valueType);
    const statusOption = this.statusOptions.find(option => option.label === this.mapStatusToLabel(dto.status));

    const extraServices = dto.extraServices ?? [];

    this.addSiteForm.patchValue({
      siteName: row.siteName ?? dto.siteName ?? dto.name ?? '',
      companyId: dto.companyId ?? null,
      valueType,
      fixedValue: this.getFixedValueInput(dto.fixedValue),
      percentage: this.getPercentageInput(dto.percentage),
      address: dto.address ?? '',
      status: statusOption?.value ?? 1
    });
    this.updateValueTypeControls(valueType);

    this.extraServicesArray.clear();
    if (Array.isArray(extraServices) && extraServices.length > 0) {
      this.loadExtraServicesFromDto(extraServices);
      this.enableExtraServices = extraServices.some(service => service?.enabled);
    } else {
      this.loadExtraServicesFromLabels(this.defaultExtraServices);
      this.enableExtraServices = false;
    }
  }

  deleteSite(row: SiteRow, event?: Event): void {
    event?.stopPropagation();
    this.openSiteMenuIndex = null;
    this.pendingDeleteSite = row;
    this.showDeleteConfirm = true;
  }

  toggleSiteMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.openSiteMenuIndex = this.openSiteMenuIndex === index ? null : index;
  }


  @HostListener('document:click')
  onDocumentClick(): void {
    this.openSiteMenuIndex = null;
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;

    setTimeout(() => {
      this.notificationMessage = null;
    }, 3000);
  }

  confirmDelete(): void {
    if (!this.pendingDeleteSite?.id) {
      this.showDeleteConfirm = false;
      return;
    }

    const siteId = this.pendingDeleteSite.id;
    this.showDeleteConfirm = false;
    this.pendingDeleteSite = null;
    this.isLoading = true;

    this.sitesService.deleteSite(siteId).subscribe({
      next: (response) => {
        console.log('Deleted site', response);
        this.showNotification('Site deleted successfully.', 'success');
        this.loadSites(); // Refresh the sites grid
      },
      error: (error) => {
        console.error('Failed to delete site', error);
        this.showNotification('Failed to delete site. Please try again.', 'error');
        this.isLoading = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.pendingDeleteSite = null;
  }

  viewSiteDetails(row: SiteRow, event?: Event): void {
    event?.stopPropagation();
    this.openSiteMenuIndex = null;
    
    // Navigate to the site details page
    this.router.navigate(['/settings/sites', row.id]);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSites();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadSites();
    }
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadSites();
    }
  }

  getPageNumbers(): (number | string)[] {
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
}
