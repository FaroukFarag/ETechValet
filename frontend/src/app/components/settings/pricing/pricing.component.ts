import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface PricingRow {
  gateName: string;
  siteName: string;
  valetPricingType: 'Fixed Amount' | 'Hourly Rate';
  dailyRate: string;
  hourlyRate: string;
  maxDailyRate: string;
  freeHours: string;
  calendarBasedPricing: boolean;
}

@Component({
  selector: 'app-settings-pricing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent {
  tabs: Array<'Guests' | 'Visitors'> = ['Guests', 'Visitors'];
  activeTab: 'Guests' | 'Visitors' = 'Guests';

  pricingData: PricingRow[] = [
    { gateName: 'Main', siteName: 'Bujairi Terrace', valetPricingType: 'Fixed Amount', dailyRate: '50.00 SAR', hourlyRate: '-', maxDailyRate: '-', freeHours: '30 Minutes', calendarBasedPricing: true },
    { gateName: 'Main', siteName: 'Riyadh Park', valetPricingType: 'Fixed Amount', dailyRate: '50.00 SAR', hourlyRate: '-', maxDailyRate: '-', freeHours: '30 Minutes', calendarBasedPricing: false },
    { gateName: 'A1', siteName: 'King Faisal Hospital', valetPricingType: 'Hourly Rate', dailyRate: '-', hourlyRate: '10.00 SAR', maxDailyRate: '80.00 SAR', freeHours: '30 Minutes', calendarBasedPricing: true },
    { gateName: 'A2', siteName: 'Red Sea Mall', valetPricingType: 'Fixed Amount', dailyRate: '50.00 SAR', hourlyRate: '-', maxDailyRate: '-', freeHours: '30 Minutes', calendarBasedPricing: true },
    { gateName: 'b2', siteName: 'Al noor Specialist Hospital', valetPricingType: 'Hourly Rate', dailyRate: '-', hourlyRate: 'Visitor', maxDailyRate: '80.00 SAR', freeHours: '30 Minutes', calendarBasedPricing: false },
    { gateName: 'b2', siteName: 'Al noor Specialist Hospital', valetPricingType: 'Hourly Rate', dailyRate: '-', hourlyRate: '-', maxDailyRate: '-', freeHours: '30 Minutes', calendarBasedPricing: false },
    { gateName: 'b2', siteName: 'Al noor Specialist Hospital', valetPricingType: 'Fixed Amount', dailyRate: '50.00 SAR', hourlyRate: '-', maxDailyRate: '-', freeHours: '30 Minutes', calendarBasedPricing: true },
    { gateName: 'b2', siteName: 'Al noor Specialist Hospital', valetPricingType: 'Fixed Amount', dailyRate: '50.00 SAR', hourlyRate: '-', maxDailyRate: '-', freeHours: '30 Minutes', calendarBasedPricing: true }
  ];

  openMenuIndex: number | null = null;
  showDrawer = false;
  pricingForm: FormGroup;
  pricingFormTab: 'Guest Pricing' | 'Visitor Pricing' = 'Guest Pricing';
  valetPricingTypes = [
    { label: 'Fixed Amount', value: 'fixed' },
    { label: 'Hourly Rate', value: 'hourly' }
  ];
  gateOptions = ['Main', 'A1', 'A2', 'b2'];
  siteOptions = ['Bujairi Terrace', 'Riyadh Park', 'King Faisal Hospital', 'Red Sea Mall', 'Al noor Specialist Hospital'];
  weekdayOptions = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  filterDropdownOpen = false;
  activeFilter: 'All' | 'Valet' | 'Parking' = 'All';

  constructor(private fb: FormBuilder) {
    this.pricingForm = this.fb.group({
      gateName: ['', Validators.required],
      siteName: ['', Validators.required],
      valetGuestPricingEnabled: [true],
      valetGuestPricingType: ['fixed', Validators.required],
      valetGuestDailyRate: ['50.00', Validators.required],
      valetGuestFreeHours: ['30 Minutes', Validators.required],
      parkingGuestPricingEnabled: [true],
      parkingGuestPricingType: ['fixed', Validators.required],
      parkingGuestDailyRate: ['50.00', Validators.required],
      parkingGuestFreeHours: ['30 Minutes', Validators.required],
      calendarPricingEnabled: [false],
      calendarPricingStartDate: [''],
      calendarPricingEndDate: [''],
      calendarPricingType: [''],
      weekdayPricingEnabled: [false],
      weekdayPricingDays: [[]],
      weekdayPricingType: [''],
      repeatPricing: ['']
    });
  }

  setActiveTab(tab: 'Guests' | 'Visitors'): void {
    this.activeTab = tab;
    this.closeMenus();
  }

  toggleCalendarPricing(row: PricingRow, event: Event): void {
    event.stopPropagation();
    row.calendarBasedPricing = !row.calendarBasedPricing;
  }

  toggleRowMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  openDrawer(): void {
    this.showDrawer = true;
    this.pricingFormTab = 'Guest Pricing';
    this.pricingForm.reset({
      gateName: '',
      siteName: '',
      valetGuestPricingEnabled: true,
      valetGuestPricingType: 'fixed',
      valetGuestDailyRate: '50.00',
      valetGuestFreeHours: '30 Minutes',
      parkingGuestPricingEnabled: true,
      parkingGuestPricingType: 'fixed',
      parkingGuestDailyRate: '50.00',
      parkingGuestFreeHours: '30 Minutes',
      calendarPricingEnabled: false,
      calendarPricingStartDate: '',
      calendarPricingEndDate: '',
      calendarPricingType: '',
      weekdayPricingEnabled: false,
      weekdayPricingDays: [[]],
      weekdayPricingType: '',
      repeatPricing: ''
    });
  }

  closeDrawer(): void {
    this.showDrawer = false;
  }

  submitPricing(): void {
    if (this.pricingForm.invalid) {
      this.pricingForm.markAllAsTouched();
      return;
    }

    console.log('Pricing payload', this.pricingForm.value);
    this.showDrawer = false;
  }

  selectWeekday(day: string): void {
    const current = new Set(this.pricingForm.value.weekdayPricingDays ?? []);
    if (current.has(day)) {
      current.delete(day);
    } else {
      current.add(day);
    }
    this.pricingForm.patchValue({ weekdayPricingDays: Array.from(current) });
  }

  editPricing(row: PricingRow, event?: Event): void {
    event?.stopPropagation();
    console.log('Edit pricing', row);
    this.openMenuIndex = null;
  }

  deletePricing(row: PricingRow, event?: Event): void {
    event?.stopPropagation();
    console.log('Delete pricing', row);
    this.openMenuIndex = null;
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.openMenuIndex = null;
    this.filterDropdownOpen = false;
  }

  toggleFilterDropdown(event: Event): void {
    event.stopPropagation();
    this.filterDropdownOpen = !this.filterDropdownOpen;
  }

  selectFilter(option: 'All' | 'Valet' | 'Parking', event: Event): void {
    event.stopPropagation();
    this.activeFilter = option;
    this.filterDropdownOpen = false;
  }

  get filteredPricingData(): PricingRow[] {
    if (this.activeFilter === 'All') {
      return this.pricingData;
    }
    if (this.activeFilter === 'Valet') {
      return this.pricingData;
    }
    if (this.activeFilter === 'Parking') {
      return this.pricingData;
    }
    return this.pricingData;
  }
}
