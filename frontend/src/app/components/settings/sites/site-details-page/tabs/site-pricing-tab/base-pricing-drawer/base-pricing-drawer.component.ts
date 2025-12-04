import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PricingsService, CreatePricingPayload, UpdatePricingPayload } from '../../../../../../../services/pricings.service';

@Component({
  selector: 'app-base-pricing-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './base-pricing-drawer.component.html',
  styleUrls: ['./base-pricing-drawer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BasePricingDrawerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() siteId: number | null = null;
  @Input() isOpen: boolean = false;
  @Input() editPricingData: any = null;
  @Input() customerTypeOptions: { label: string; value: number }[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  basePricingForm: FormGroup;
  isSaving = false;
  isEditMode = false;

  defaultCustomerTypeOptions = [
    { label: 'All Customers', value: 1 },
    { label: 'Visitor', value: 2 },
    { label: 'VIP', value: 3 },
    { label: 'Regular', value: 4 }
  ];
  displayCustomerTypeOptions = [...this.defaultCustomerTypeOptions];

  pricingTypeOptions = [
    { label: 'Fixed Amount', value: 1 },
    { label: 'Hourly Rate', value: 2 },
    { label: 'Daily Max Rate', value: 3 }
  ];

  parkingPricingTypeOptions = [
    { label: 'Fixed Amount', value: 1 },
    { label: 'Hourly Rate', value: 2 },
    { label: 'Daily Max Rate', value: 3 }
  ];

  parkingGuestPricingTypeOptions = [
    { label: 'Fixed Amount', value: 1 },
    { label: 'Hourly Rate', value: 2 }
  ];

  valetGuestPricingTypeOptions = [
    { label: 'Fixed Amount', value: 1 },
    { label: 'Hourly Rate', value: 2 }
  ];

  daysOfWeek = [
    { label: 'Sat', value: 0, dayName: 'Saturday', checked: false },
    { label: 'Sun', value: 1, dayName: 'Sunday', checked: false },
    { label: 'Mon', value: 2, dayName: 'Monday', checked: false },
    { label: 'Tue', value: 3, dayName: 'Tuesday', checked: false },
    { label: 'Wed', value: 4, dayName: 'Wednesday', checked: false },
    { label: 'Thu', value: 5, dayName: 'Thursday', checked: false },
    { label: 'Fri', value: 6, dayName: 'Friday', checked: false }
  ];

  constructor(
    private fb: FormBuilder,
    private pricingsService: PricingsService
  ) {
    this.basePricingForm = this.fb.group({
      customerType: ['', Validators.required],
      pricingType: [1, Validators.required],
      dailyRate: [0],
      hourlyRate: [0],
      dailyMaxRate: [0],
      freeHours: [0],
      valetGuestPricingEnabled: [true],
      valetGuestPricingType: [1], // Default to Fixed Amount
      valetFixedPrice: [0],
      valetGuestHourlyRate: [0],
      valetGuestDailyMaxRate: [0],
      parkingEnabled: [true],
      parkingPricingType: [1],
      parkingDailyRate: [0],
      parkingHourlyRate: [0],
      parkingFreeHours: [0],
      parkingGuestPricingEnabled: [false],
      parkingGuestPricingType: [1], // Default to Fixed Amount
      parkingGuestFixedPrice: [0],
      parkingGuestHourlyRate: [0],
      parkingGuestDailyMaxRate: [0],
      applyToAllGates: [true],
      weekDayBasedEnabled: [true]
    });

    this.updateCustomerTypeOptions();

    // Watch pricing type changes
    this.basePricingForm.get('pricingType')?.valueChanges.subscribe(value => {
      this.updatePricingTypeValidators(value);
    });

    // Watch parking toggle
    this.basePricingForm.get('parkingEnabled')?.valueChanges.subscribe(enabled => {
      if (enabled) {
        this.basePricingForm.get('parkingPricingType')?.setValidators([Validators.required]);
        this.basePricingForm.get('parkingDailyRate')?.setValidators([Validators.required]);
        this.basePricingForm.get('parkingFreeHours')?.setValidators([Validators.required]);
        this.basePricingForm.get('parkingHourlyRate')?.setValidators([Validators.required]);
      } else {
        this.basePricingForm.get('parkingPricingType')?.clearValidators();
        this.basePricingForm.get('parkingDailyRate')?.clearValidators();
        this.basePricingForm.get('parkingFreeHours')?.clearValidators();
        this.basePricingForm.get('parkingHourlyRate')?.clearValidators();
      }
      this.basePricingForm.get('parkingPricingType')?.updateValueAndValidity();
      this.basePricingForm.get('parkingDailyRate')?.updateValueAndValidity();
      this.basePricingForm.get('parkingFreeHours')?.updateValueAndValidity();
      this.basePricingForm.get('parkingHourlyRate')?.updateValueAndValidity();
    });

    // Watch parking guest pricing toggle
    this.basePricingForm.get('parkingGuestPricingEnabled')?.valueChanges.subscribe(enabled => {
      this.updateParkingGuestPricingValidators();
    });

    // Watch parking guest pricing type changes
    this.basePricingForm.get('parkingGuestPricingType')?.valueChanges.subscribe(() => {
      this.updateParkingGuestPricingValidators();
    });

    // Watch valet guest pricing toggle
    this.basePricingForm.get('valetGuestPricingEnabled')?.valueChanges.subscribe(enabled => {
      this.updateValetGuestPricingValidators();
    });

    // Watch valet guest pricing type changes
    this.basePricingForm.get('valetGuestPricingType')?.valueChanges.subscribe(() => {
      this.updateValetGuestPricingValidators();
    });
  }

  onValetGuestPricingTypeChange() {
    // Update validators when pricing type changes
    this.updateValetGuestPricingValidators();
  }

  updateValetGuestPricingValidators() {
    const enabled = this.basePricingForm.get('valetGuestPricingEnabled')?.value;
    const pricingType = Number(this.basePricingForm.get('valetGuestPricingType')?.value ?? 1);

    const pricingTypeControl = this.basePricingForm.get('valetGuestPricingType');
    const fixedPriceControl = this.basePricingForm.get('valetFixedPrice');
    const hourlyRateControl = this.basePricingForm.get('valetGuestHourlyRate');
    const dailyMaxRateControl = this.basePricingForm.get('valetGuestDailyMaxRate');

    if (!enabled) {
      // Clear validators and reset values when disabled
      pricingTypeControl?.clearValidators();
      pricingTypeControl?.setValue(1, { emitEvent: false });
      pricingTypeControl?.updateValueAndValidity({ emitEvent: false });
      fixedPriceControl?.clearValidators();
      fixedPriceControl?.setValue(0, { emitEvent: false });
      hourlyRateControl?.clearValidators();
      hourlyRateControl?.setValue(0, { emitEvent: false });
      dailyMaxRateControl?.clearValidators();
      dailyMaxRateControl?.setValue(0, { emitEvent: false });
      fixedPriceControl?.updateValueAndValidity({ emitEvent: false });
      hourlyRateControl?.updateValueAndValidity({ emitEvent: false });
      dailyMaxRateControl?.updateValueAndValidity({ emitEvent: false });
      return;
    }

    // Set validators based on pricing type
    pricingTypeControl?.setValidators([Validators.required]);
    pricingTypeControl?.updateValueAndValidity({ emitEvent: false });

    if (pricingType === 1) {
      // Fixed Amount - fixed price required
      fixedPriceControl?.setValidators([Validators.required, Validators.min(0)]);
      fixedPriceControl?.updateValueAndValidity();
      hourlyRateControl?.clearValidators();
      hourlyRateControl?.setValue(0, { emitEvent: false });
      hourlyRateControl?.updateValueAndValidity();
      dailyMaxRateControl?.clearValidators();
      dailyMaxRateControl?.setValue(0, { emitEvent: false });
      dailyMaxRateControl?.updateValueAndValidity();
    } else if (pricingType === 2) {
      // Hourly Rate - hourly rate and daily max rate required
      hourlyRateControl?.setValidators([Validators.required, Validators.min(0)]);
      hourlyRateControl?.updateValueAndValidity();
      dailyMaxRateControl?.setValidators([Validators.required, Validators.min(0)]);
      dailyMaxRateControl?.updateValueAndValidity();
      fixedPriceControl?.clearValidators();
      fixedPriceControl?.setValue(0, { emitEvent: false });
      fixedPriceControl?.updateValueAndValidity();
    } else {
      // Clear all if invalid pricing type
      fixedPriceControl?.clearValidators();
      fixedPriceControl?.setValue(0, { emitEvent: false });
      fixedPriceControl?.updateValueAndValidity();
      hourlyRateControl?.clearValidators();
      hourlyRateControl?.setValue(0, { emitEvent: false });
      hourlyRateControl?.updateValueAndValidity();
      dailyMaxRateControl?.clearValidators();
      dailyMaxRateControl?.setValue(0, { emitEvent: false });
      dailyMaxRateControl?.updateValueAndValidity();
    }
  }

  get showValetFixedPrice(): boolean {
    const enabled = this.basePricingForm.get('valetGuestPricingEnabled')?.value;
    const pricingType = Number(this.basePricingForm.get('valetGuestPricingType')?.value);
    return enabled && pricingType === 1;
  }

  get showValetHourlyRate(): boolean {
    const enabled = this.basePricingForm.get('valetGuestPricingEnabled')?.value;
    const pricingType = Number(this.basePricingForm.get('valetGuestPricingType')?.value);
    return enabled && pricingType === 2;
  }

  onParkingGuestPricingTypeChange() {
    // Update validators when pricing type changes
    this.updateParkingGuestPricingValidators();
  }

  updateParkingGuestPricingValidators() {
    const enabled = this.basePricingForm.get('parkingGuestPricingEnabled')?.value;
    const pricingType = Number(this.basePricingForm.get('parkingGuestPricingType')?.value ?? 1);

    const pricingTypeControl = this.basePricingForm.get('parkingGuestPricingType');
    const fixedPriceControl = this.basePricingForm.get('parkingGuestFixedPrice');
    const hourlyRateControl = this.basePricingForm.get('parkingGuestHourlyRate');
    const dailyMaxRateControl = this.basePricingForm.get('parkingGuestDailyMaxRate');

    if (!enabled) {
      // Clear validators and reset values when disabled
      pricingTypeControl?.clearValidators();
      pricingTypeControl?.setValue(1, { emitEvent: false });
      pricingTypeControl?.updateValueAndValidity({ emitEvent: false });
      fixedPriceControl?.clearValidators();
      fixedPriceControl?.setValue(0, { emitEvent: false });
      hourlyRateControl?.clearValidators();
      hourlyRateControl?.setValue(0, { emitEvent: false });
      dailyMaxRateControl?.clearValidators();
      dailyMaxRateControl?.setValue(0, { emitEvent: false });
      fixedPriceControl?.updateValueAndValidity({ emitEvent: false });
      hourlyRateControl?.updateValueAndValidity({ emitEvent: false });
      dailyMaxRateControl?.updateValueAndValidity({ emitEvent: false });
      return;
    }

    // Set validators based on pricing type
    pricingTypeControl?.setValidators([Validators.required]);
    pricingTypeControl?.updateValueAndValidity({ emitEvent: false });

    if (pricingType === 1) {
      // Fixed Amount - fixed price required
      fixedPriceControl?.setValidators([Validators.required, Validators.min(0)]);
      fixedPriceControl?.updateValueAndValidity();
      hourlyRateControl?.clearValidators();
      hourlyRateControl?.setValue(0, { emitEvent: false });
      hourlyRateControl?.updateValueAndValidity();
      dailyMaxRateControl?.clearValidators();
      dailyMaxRateControl?.setValue(0, { emitEvent: false });
      dailyMaxRateControl?.updateValueAndValidity();
    } else if (pricingType === 2) {
      // Hourly Rate - hourly rate and daily max rate required
      hourlyRateControl?.setValidators([Validators.required, Validators.min(0)]);
      hourlyRateControl?.updateValueAndValidity();
      dailyMaxRateControl?.setValidators([Validators.required, Validators.min(0)]);
      dailyMaxRateControl?.updateValueAndValidity();
      fixedPriceControl?.clearValidators();
      fixedPriceControl?.setValue(0, { emitEvent: false });
      fixedPriceControl?.updateValueAndValidity();
    } else {
      // Clear all if invalid pricing type
      fixedPriceControl?.clearValidators();
      fixedPriceControl?.setValue(0, { emitEvent: false });
      fixedPriceControl?.updateValueAndValidity();
      hourlyRateControl?.clearValidators();
      hourlyRateControl?.setValue(0, { emitEvent: false });
      hourlyRateControl?.updateValueAndValidity();
      dailyMaxRateControl?.clearValidators();
      dailyMaxRateControl?.setValue(0, { emitEvent: false });
      dailyMaxRateControl?.updateValueAndValidity();
    }
  }

  get showParkingGuestFixedPrice(): boolean {
    const enabled = this.basePricingForm.get('parkingGuestPricingEnabled')?.value;
    const pricingType = Number(this.basePricingForm.get('parkingGuestPricingType')?.value);
    return enabled && pricingType === 1;
  }

  get showParkingGuestHourlyRate(): boolean {
    const enabled = this.basePricingForm.get('parkingGuestPricingEnabled')?.value;
    const pricingType = Number(this.basePricingForm.get('parkingGuestPricingType')?.value);
    return enabled && pricingType === 2;
  }

  updatePricingTypeValidators(pricingType: number) {
    const dailyRateControl = this.basePricingForm.get('dailyRate');
    const hourlyRateControl = this.basePricingForm.get('hourlyRate');
    const dailyMaxRateControl = this.basePricingForm.get('dailyMaxRate');
    const freeHoursControl = this.basePricingForm.get('freeHours');

    // Clear all validators first
    dailyRateControl?.clearValidators();
    hourlyRateControl?.clearValidators();
    dailyMaxRateControl?.clearValidators();
    freeHoursControl?.clearValidators();

    // Set validators based on pricing type
    if (pricingType === 1) {
      // Fixed Amount - dailyRate required
      dailyRateControl?.setValidators([Validators.required]);
      freeHoursControl?.setValidators([Validators.required]);
    } else if (pricingType === 2) {
      // Hourly Rate - hourlyRate and dailyMaxRate required
      hourlyRateControl?.setValidators([Validators.required]);
      dailyMaxRateControl?.setValidators([Validators.required]);
      freeHoursControl?.setValidators([Validators.required]);
    } else if (pricingType === 3) {
      // Daily Max Rate - dailyMaxRate required
      dailyMaxRateControl?.setValidators([Validators.required]);
      freeHoursControl?.setValidators([Validators.required]);
    }

    dailyRateControl?.updateValueAndValidity();
    hourlyRateControl?.updateValueAndValidity();
    dailyMaxRateControl?.updateValueAndValidity();
    freeHoursControl?.updateValueAndValidity();
  }

  get showHourlyRate(): boolean {
    return this.basePricingForm.get('pricingType')?.value === 2;
  }

  get showDailyMaxRate(): boolean {
    return this.basePricingForm.get('pricingType')?.value === 2 || this.basePricingForm.get('pricingType')?.value === 3;
  }

  get showDailyRate(): boolean {
    return this.basePricingForm.get('pricingType')?.value === 1;
  }

  selectAllDays() {
    const allSelected = this.daysOfWeek.every(day => day.checked);
    this.daysOfWeek.forEach(day => {
      day.checked = !allSelected;
    });
  }

  get allDaysSelected(): boolean {
    return this.daysOfWeek.every(day => day.checked);
  }

  ngOnInit() {
    // Lock body scroll if drawer is initially open
    if (this.isOpen) {
      this.lockBodyScroll();
    }
    // Initialize validators for valet guest pricing
    this.updateValetGuestPricingValidators();
    // Initialize validators for parking guest pricing
    this.updateParkingGuestPricingValidators();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Lock/unlock body scroll when isOpen changes
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.lockBodyScroll();
        // Check if we're in edit mode
        if (this.editPricingData) {
          this.isEditMode = true;
          this.populateFormForEdit();
        } else {
          this.isEditMode = false;
          this.resetForm();
        }
      } else {
        this.unlockBodyScroll();
        this.isEditMode = false;
      }
    }

    if (changes['customerTypeOptions']) {
      this.updateCustomerTypeOptions();
    }

    if (changes['editPricingData'] && this.isOpen) {
      if (this.editPricingData) {
        this.isEditMode = true;
        this.populateFormForEdit();
      } else {
        this.isEditMode = false;
        this.resetForm();
      }
    }
  }

  private populateFormForEdit() {
    if (!this.editPricingData) return;

    console.log('Populating form for edit:', this.editPricingData);

    // Map customer type string back to value
    const customerTypeMap: { [key: string]: number } = {
      'All Customers': 1,
      'Visitor': 2,
      'VIP': 3,
      'Regular': 4
    };

    // Map pricing type string back to value
    const pricingTypeMap: { [key: string]: number } = {
      'Fixed Amount': 1,
      'Hourly Rate': 2,
      'Daily Max Rate': 3
    };

    const customerTypeValue = customerTypeMap[this.editPricingData.customerType] || 1;
    const pricingTypeValue = pricingTypeMap[this.editPricingData.pricingType] || 1;

    // Set form values
    this.basePricingForm.patchValue({
      customerType: customerTypeValue,
      pricingType: pricingTypeValue
    });

    // Set days if available
    if (this.editPricingData.days && this.editPricingData.days !== 'All Days') {
      const selectedDays = this.editPricingData.days.split(', ');
      this.daysOfWeek.forEach(day => {
        day.checked = selectedDays.includes(day.label);
      });
    } else {
      // Select all days
      this.daysOfWeek.forEach(day => day.checked = true);
    }
  }

  private resetForm() {
    this.basePricingForm.reset({
      customerType: '',
      pricingType: 1,
      dailyRate: 0,
      hourlyRate: 0,
      dailyMaxRate: 0,
      freeHours: 0,
      valetGuestPricingEnabled: true,
      valetGuestPricingType: 1,
      valetFixedPrice: 0,
      valetGuestHourlyRate: 0,
      valetGuestDailyMaxRate: 0,
      parkingEnabled: true,
      parkingPricingType: 1,
      parkingDailyRate: 0,
      parkingHourlyRate: 0,
      parkingFreeHours: 0,
      parkingGuestPricingEnabled: false,
      parkingGuestPricingType: 1,
      parkingGuestFixedPrice: 0,
      parkingGuestHourlyRate: 0,
      parkingGuestDailyMaxRate: 0,
      applyToAllGates: true,
      weekDayBasedEnabled: true
    });
    this.daysOfWeek.forEach(day => day.checked = false);
  }

  ngOnDestroy() {
    // Ensure body scroll is unlocked when component is destroyed
    this.unlockBodyScroll();
  }

  private lockBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScroll(): void {
    document.body.style.overflow = '';
  }

  private updateCustomerTypeOptions(): void {
    const incoming = Array.isArray(this.customerTypeOptions) ? this.customerTypeOptions : [];
    this.displayCustomerTypeOptions = incoming.length > 0 ? incoming : [...this.defaultCustomerTypeOptions];

    const control = this.basePricingForm.get('customerType');
    if (!control) {
      return;
    }

    const currentValue = control.value;
    const hasCurrent = this.displayCustomerTypeOptions.some(option => option.value === Number(currentValue));

    if (!hasCurrent) {
      const fallbackValue = this.displayCustomerTypeOptions[0]?.value ?? '';
      control.setValue(fallbackValue);
    }
  }

  onClose() {
    if (this.isSaving) return;
    this.basePricingForm.reset({
      customerType: this.displayCustomerTypeOptions[0]?.value ?? '',
      pricingType: 1,
      dailyRate: 0,
      hourlyRate: 0,
      dailyMaxRate: 0,
      freeHours: 0,
      valetGuestPricingEnabled: true,
      valetGuestPricingType: 1,
      valetFixedPrice: 0,
      valetGuestHourlyRate: 0,
      valetGuestDailyMaxRate: 0,
      parkingEnabled: true,
      parkingPricingType: 1,
      parkingDailyRate: 0,
      parkingHourlyRate: 0,
      parkingFreeHours: 0,
      parkingGuestPricingEnabled: false,
      parkingGuestPricingType: 1,
      parkingGuestFixedPrice: 0,
      parkingGuestHourlyRate: 0,
      parkingGuestDailyMaxRate: 0,
      applyToAllGates: true,
      weekDayBasedEnabled: true
    });
    this.daysOfWeek.forEach(day => day.checked = false);
    this.unlockBodyScroll();
    this.close.emit();
  }

  onSubmit() {
    if (this.basePricingForm.invalid || this.isSaving || !this.siteId) {
      this.basePricingForm.markAllAsTouched();
      if (!this.siteId) {
        alert('Site ID is required');
      }
      return;
    }

    const selectedDays = this.daysOfWeek.filter(day => day.checked);
    if (selectedDays.length === 0 && this.basePricingForm.get('weekDayBasedEnabled')?.value) {
      alert('Please select at least one day');
      return;
    }

    this.isSaving = true;
    const formValue = this.basePricingForm.value;

    // Build weekDayPricings array if weekDayBasedEnabled is true
    const weekDayPricings = this.basePricingForm.get('weekDayBasedEnabled')?.value && selectedDays.length > 0
      ? selectedDays.map(day => {
          // For each selected day, use the main pricing values
          // You might want to add per-day pricing in the future
          return {
            weekDayPricingType: formValue.pricingType,
            dayOfWeek: day.value,
            hourlyRate: formValue.hourlyRate || 0,
            dailyRate: formValue.dailyRate || 0,
            freeHours: formValue.freeHours || 0,
            dailyMaxRate: formValue.dailyMaxRate || 0
          };
        })
      : [];

    const payload: CreatePricingPayload = {
      siteId: this.siteId,
      customerType: parseInt(formValue.customerType),
      pricingType: parseInt(formValue.pricingType),
      dailyRate: parseFloat(formValue.dailyRate) || 0,
      freeHours: parseFloat(formValue.freeHours) || 0,
      hourlyRate: parseFloat(formValue.hourlyRate) || 0,
      dailyMaxRate: parseFloat(formValue.dailyMaxRate) || 0,
      parkingEnabled: formValue.parkingEnabled || false,
      parkingPricingType: parseInt(formValue.parkingPricingType) || 1,
      parkingDailyRate: parseFloat(formValue.parkingDailyRate) || 0,
      parkingFreeHours: parseFloat(formValue.parkingFreeHours) || 0,
      parkingHourlyRate: parseFloat(formValue.parkingHourlyRate) || 0,
      applyToAllGates: formValue.applyToAllGates !== false,
      weekDayBasedEnabled: formValue.weekDayBasedEnabled !== false,
      weekDayPricings: weekDayPricings
    };

    if (this.isEditMode && this.editPricingData?.id) {
      // Update existing pricing
      const updatePayload: UpdatePricingPayload = {
        id: this.editPricingData.id,
        type: parseInt(formValue.customerType) || 1,
        number: parseInt(formValue.pricingType) || 1,
        siteId: this.siteId,
        status: 1
      };

      console.log('Updating pricing with payload:', updatePayload);

      this.pricingsService.updatePricing(updatePayload).subscribe({
        next: (response) => {
          console.log('Pricing updated successfully', response);
          
          if (response?.isSuccess === false) {
            alert(response.message || 'Failed to update pricing');
            this.isSaving = false;
          } else {
            this.isSaving = false;
            this.onClose();
            // Emit event to reload pricing table
            this.save.emit({ success: true });
          }
        },
        error: (error) => {
          console.error('Failed to update pricing', error);
          const errorMessage = error?.error?.message || 
                             error?.message || 
                             'Failed to update pricing. Please try again.';
          alert(errorMessage);
          this.isSaving = false;
        }
      });
    } else {
      // Create new pricing
      console.log('Creating pricing with payload:', payload);

      this.pricingsService.createPricing(payload).subscribe({
        next: (response) => {
          console.log('Pricing created successfully', response);
          
          if (response?.isSuccess === false) {
            alert(response.message || 'Failed to create pricing');
            this.isSaving = false;
          } else {
            this.isSaving = false;
            this.onClose();
            // Emit event to reload pricing table
            this.save.emit({ success: true });
          }
        },
        error: (error) => {
          console.error('Failed to create pricing', error);
          const errorMessage = error?.error?.message || 
                             error?.message || 
                             (error?.error?.isSuccess === false ? error?.error?.message : 'Failed to create pricing. Please try again.');
          alert(errorMessage);
          this.isSaving = false;
        }
      });
    }
  }
}


