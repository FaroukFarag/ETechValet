import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface ValidatorRow {
  id: number;
  name: string;
  siteName: string;
  siteId: number;
  description: string;
  currentBalance: number;
  totalAddedBalance: number;
  totalUsedBalance: number;
  totalValidation: number;
}

interface SiteOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-settings-validator-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './validator-list.component.html',
  styleUrls: ['./validator-list.component.scss']
})
export class ValidatorListComponent implements OnInit {
  // Data
  validators: ValidatorRow[] = [];
  siteOptions: SiteOption[] = [];
  
  // Loading states
  isLoading = false;
  loadError: string | null = null;
  isSaving = false;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalCount = 0;
  
  // Menu
  openMenuIndex: number | null = null;
  
  // Drawer
  showAddValidatorDrawer = false;
  isEditMode = false;
  editingValidator: ValidatorRow | null = null;
  addValidatorForm: FormGroup;
  
  // Delete confirmation
  showDeleteConfirm = false;
  validatorToDelete: ValidatorRow | null = null;

  constructor(private fb: FormBuilder) {
    this.addValidatorForm = this.fb.group({
      name: ['', Validators.required],
      siteId: [null, Validators.required],
      credits: ['', Validators.required],
      description: ['', Validators.required],
      canValidateParking: [false],
      canValidateService1: [false],
      canValidateValet: [false],
      canValidateService2: [false],
      discountFixed: [false],
      discountFixedValue: [''],
      percentage: [false],
      percentageValue: ['']
    });
  }

  ngOnInit() {
    this.loadValidators();
    this.loadSites();
  }

  // Getters for template
  get isDiscountFixedEnabled(): boolean {
    return this.addValidatorForm.get('discountFixed')?.value === true;
  }

  get isPercentageEnabled(): boolean {
    return this.addValidatorForm.get('percentage')?.value === true;
  }

  get pageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(this.totalPages);
      }
    }
    return pages;
  }

  // Data loading
  loadValidators() {
    this.isLoading = true;
    this.loadError = null;
    
    // TODO: Replace with actual API call
    setTimeout(() => {
      this.validators = [];
      this.totalCount = 0;
      this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
      this.isLoading = false;
    }, 500);
  }

  loadSites() {
    // TODO: Replace with actual API call
    this.siteOptions = [
      { id: 1, name: 'Site 1' },
      { id: 2, name: 'Site 2' },
      { id: 3, name: 'Site 3' }
    ];
  }

  // Formatting
  formatNumber(value: number | undefined | null): string {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString();
  }

  // Menu actions
  toggleMenu(index: number, event: Event) {
    event.stopPropagation();
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-trigger') && !target.closest('.menu-panel')) {
      this.openMenuIndex = null;
    }
  }

  // Export
  exportValidators() {
    console.log('Export validators');
    // TODO: Implement export functionality
  }

  // Add/Edit validator
  addNewValidator() {
    this.isEditMode = false;
    this.editingValidator = null;
    this.addValidatorForm.reset({
      name: '',
      siteId: null,
      credits: '',
      description: '',
      canValidateParking: false,
      canValidateService1: false,
      canValidateValet: false,
      canValidateService2: false,
      discountFixed: false,
      discountFixedValue: '',
      percentage: false,
      percentageValue: ''
    });
    this.showAddValidatorDrawer = true;
  }

  editValidator(validator: ValidatorRow, event: Event) {
    event.stopPropagation();
    this.openMenuIndex = null;
    this.isEditMode = true;
    this.editingValidator = validator;
    
    this.addValidatorForm.patchValue({
      name: validator.name,
      siteId: validator.siteId,
      credits: validator.currentBalance?.toString() || '',
      description: validator.description
    });
    
    this.showAddValidatorDrawer = true;
  }

  closeAddValidatorDrawer() {
    this.showAddValidatorDrawer = false;
    this.isEditMode = false;
    this.editingValidator = null;
  }

  submitAddValidator() {
    if (this.addValidatorForm.invalid || this.isSaving) {
      this.addValidatorForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formValue = this.addValidatorForm.value;

    // TODO: Replace with actual API call
    console.log('Submit validator:', formValue);
    
    setTimeout(() => {
      this.isSaving = false;
      this.closeAddValidatorDrawer();
      this.loadValidators();
    }, 1000);
  }

  // Delete validator
  deleteValidator(validator: ValidatorRow, event: Event) {
    event.stopPropagation();
    this.openMenuIndex = null;
    this.validatorToDelete = validator;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.validatorToDelete = null;
  }

  confirmDelete() {
    if (!this.validatorToDelete) return;

    // TODO: Replace with actual API call
    console.log('Delete validator:', this.validatorToDelete);
    
    this.showDeleteConfirm = false;
    this.validatorToDelete = null;
    this.loadValidators();
  }

  // Pagination
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadValidators();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadValidators();
    }
  }

  goToPage(page: number | string) {
    if (typeof page === 'number' && page !== this.currentPage) {
      this.currentPage = page;
      this.loadValidators();
    }
  }

  // Drawer scroll handlers
  onDrawerBodyScroll(event: Event) {
    // Handle drawer body scroll if needed
  }

  onDrawerWheel(event: WheelEvent) {
    // Prevent scroll from propagating to parent
    event.stopPropagation();
  }
}
