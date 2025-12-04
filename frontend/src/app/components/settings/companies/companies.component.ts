import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompaniesService, CreateCompanyPayload, CompanyDto } from '../../../services/companies.service';

@Component({
  selector: 'app-settings-companies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit {
  companies: CompanyDto[] = [];

  currentPage = 1;
  totalPages = 10;
  maxVisiblePages = 5;

  showAddCompanyDrawer = false;
  isSaving = false;
  isEditMode = false;
  editingCompany: CompanyDto | null = null;
  showDeleteConfirm = false;
  pendingDeleteCompany: CompanyDto | null = null;
  isLoading = false;
  loadError: string | null = null;
  openMenuIndex: number | null = null;
  addCompanyForm: FormGroup;

  constructor(private fb: FormBuilder, private companiesService: CompaniesService) {
    this.addCompanyForm = this.fb.group({
      name: ['', Validators.required],
      shortName: ['', Validators.required],
      contactPerson: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.minLength(6)]],
      address: ['', Validators.required],
      commercialRegistration: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchCompanies();
  }

  fetchCompanies(): void {
    this.isLoading = true;
    this.loadError = null;

    this.companiesService.getAllCompanies().subscribe({
      next: (companies) => {
        this.companies = companies ?? [];
        this.isLoading = false;
        this.openMenuIndex = null;
      },
      error: (error) => {
        console.error('Failed to load companies', error);
        this.loadError = 'Failed to load companies. Please try again.';
        this.isLoading = false;
      }
    });
  }

  exportCompanies(): void {
    console.log('Export companies');
  }

  openAddCompany(): void {
    this.showAddCompanyDrawer = true;
    this.isEditMode = false;
    this.editingCompany = null;
    this.addCompanyForm.reset({
      name: '',
      shortName: '',
      contactPerson: '',
      phoneNumber: '',
      address: '',
      commercialRegistration: ''
    });
  }

  closeAddCompany(): void {
    if (this.isSaving) {
      return;
    }
    this.showAddCompanyDrawer = false;
  }

  submitAddCompany(): void {
    if (this.addCompanyForm.invalid) {
      this.addCompanyForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const payload: CreateCompanyPayload = {
      id: this.isEditMode && this.editingCompany?.id ? this.editingCompany.id : 0,
      name: this.addCompanyForm.value.name,
      shortName: this.addCompanyForm.value.shortName,
      contactPerson: this.addCompanyForm.value.contactPerson,
      phoneNumber: this.addCompanyForm.value.phoneNumber,
      address: this.addCompanyForm.value.address,
      commercialRegistration: this.addCompanyForm.value.commercialRegistration
    };

    const request$ = this.isEditMode
      ? this.companiesService.updateCompany(payload)
      : this.companiesService.createCompany(payload);

    request$.subscribe({
      next: (response) => {
        this.fetchCompanies();
        this.isSaving = false;
        this.showAddCompanyDrawer = false;
        this.addCompanyForm.reset();
        this.isEditMode = false;
        this.editingCompany = null;
        console.log(this.isEditMode ? 'Company updated' : 'Company created', response);
      },
      error: (error) => {
        console.error(this.isEditMode ? 'Failed to update company' : 'Failed to create company', error);
        this.isSaving = false;
      }
    });
  }

  openCompanyActions(company: CompanyDto, event: Event): void {
    event.stopPropagation();
    console.log('Open actions for company:', company.name);
  }

  toggleMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  editCompany(company: CompanyDto, event?: Event): void {
    event?.stopPropagation();
    this.openMenuIndex = null;
    this.isEditMode = true;
    this.editingCompany = company;
    this.showAddCompanyDrawer = true;
    this.addCompanyForm.patchValue({
      name: company.name ?? '',
      shortName: company.shortName ?? '',
      contactPerson: company.contactPerson ?? '',
      phoneNumber: company.phoneNumber ?? '',
      address: company.address ?? '',
      commercialRegistration: company.commercialRegistration ?? ''
    });
  }

  deleteCompany(company: CompanyDto, event?: Event): void {
    event?.stopPropagation();
    this.openMenuIndex = null;
    this.pendingDeleteCompany = company;
    this.showDeleteConfirm = true;
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.openMenuIndex = null;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteCompany?.id) {
      this.showDeleteConfirm = false;
      this.pendingDeleteCompany = null;
      return;
    }

    const companyId = this.pendingDeleteCompany.id;
    this.showDeleteConfirm = false;
    this.pendingDeleteCompany = null;

    this.companiesService.deleteCompany(companyId).subscribe({
      next: (response) => {
        console.log('Deleted company', response);
        this.fetchCompanies();
      },
      error: (error) => {
        console.error('Failed to delete company', error);
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.pendingDeleteCompany = null;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  handlePageClick(page: number | string): void {
    if (typeof page === 'number') {
      this.currentPage = page;
    }
  }

  getPaginationPages(): (number | string)[] {
    const pages: (number | string)[] = [];

    if (this.totalPages <= this.maxVisiblePages + 2) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    let start = Math.max(2, this.currentPage - Math.floor(this.maxVisiblePages / 2));
    let end = Math.min(this.totalPages - 1, start + this.maxVisiblePages - 1);

    if (end >= this.totalPages - 1) {
      end = this.totalPages - 1;
      start = Math.max(2, end - this.maxVisiblePages + 1);
    }

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < this.totalPages - 1) {
      pages.push('...');
    }

    pages.push(this.totalPages);
    return pages;
  }
}
