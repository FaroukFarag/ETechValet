import { Component, OnInit, ViewChild, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SiteDto, SitesService } from '../../../../services/sites.service';
import { CompaniesService, CompanyDto } from '../../../../services/companies.service';
import { GatesService, CreateGatePayload } from '../../../../services/gates.service';
import { ServicesService, ServiceDto } from '../../../../services/services.service';
import { SitesServicesService, CreateSiteServicePayload } from '../../../../services/sites-services.service';
import { GatesTabComponent } from './tabs/gates-tab/gates-tab.component';
import { ExtraServicesTabComponent } from './tabs/extra-services-tab/extra-services-tab.component';
import { SitePricingTabComponent } from './tabs/site-pricing-tab/site-pricing-tab.component';
import { PricingPerGateTabComponent } from './tabs/pricing-per-gate-tab/pricing-per-gate-tab.component';
import { UsersTabComponent } from './tabs/users-tab/users-tab.component';
import { NotificationTemplateTabComponent } from './tabs/notification-template-tab/notification-template-tab.component';
import { BasePricingDrawerComponent } from './tabs/site-pricing-tab/base-pricing-drawer/base-pricing-drawer.component';
import { CustomerTypesTabComponent } from './tabs/customer-types-tab/customer-types-tab.component';
import { CustomerTypesService, CreateCustomerTypePayload, CustomerTypeDto } from '../../../../services/customer-types.service';

import { PricingsService, CreateGatePricingPayload, WeekDayPricing } from '../../../../services/pricings.service';
import { NotificationTemplatesService, CreateNotificationTemplatePayload } from '../../../../services/notification-templates.service';

type TabName = 'Gates' | 'Extra Services' | 'Site Pricing' | 'Pricing Per Gate' | 'Users' | 'Customer Types' | 'Notification Template';

@Component({
  selector: 'app-site-details-page',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    GatesTabComponent,
    ExtraServicesTabComponent,
    SitePricingTabComponent,
    PricingPerGateTabComponent,
    UsersTabComponent,
    NotificationTemplateTabComponent,
    BasePricingDrawerComponent,
    CustomerTypesTabComponent
  ],
  templateUrl: './site-details-page.component.html',
  styleUrls: ['./site-details-page.component.scss']
})
export class SiteDetailsPageComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(GatesTabComponent) gatesTabComponent!: GatesTabComponent;
  @ViewChild(SitePricingTabComponent) sitePricingTabComponent!: SitePricingTabComponent;
  @ViewChild(ExtraServicesTabComponent) extraServicesTabComponent!: ExtraServicesTabComponent;
  @ViewChild(PricingPerGateTabComponent) pricingPerGateTabComponent!: PricingPerGateTabComponent;
  @ViewChild(NotificationTemplateTabComponent) notificationTemplateTabComponent!: NotificationTemplateTabComponent;
  @ViewChild(CustomerTypesTabComponent) customerTypesTabComponent!: CustomerTypesTabComponent;

  site: SiteDto | null = null;
  isLoading = true;
  loadError: string | null = null;

  tabs: TabName[] = ['Customer Types', 'Gates', 'Extra Services', 'Site Pricing', 'Pricing Per Gate', 'Users', 'Notification Template'];
  activeTab: TabName = 'Customer Types';

  companyOptions: { id: number; label: string }[] = [];

  // Add Gate Drawer
  showAddGateDrawer = false;
  addGateForm: FormGroup;
  isSavingGate = false;

  // Add Extra Services Drawer
  showAddServicesDrawer = false;
  addServicesForm: FormGroup;
  isSavingServices = false;
  availableServices: ServiceDto[] = [];
  isLoadingServices = false;

  // Base Pricing Drawer
  showBasePricingDrawer = false;
  editPricingData: any = null;

  // Gate Pricing Drawer
  showGatePricingDrawer = false;
  gatePricingForm: FormGroup;
  isSavingGatePricing = false;
  availableGates: { id: number; name: string }[] = [];
  isLoadingGates = false;
  currentPricingType: number = 1; // Track current pricing type for change detection

  // Notification
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' = 'success';

  statusOptions = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 2 }
  ];

  // Notification Template Drawer
  showNotificationTemplateDrawer = false;
  notificationTemplateForm: FormGroup;
  isSavingNotificationTemplate = false;

  // Customer Type Drawer
  showCustomerTypeDrawer = false;
  customerTypeForm: FormGroup;
  isSavingCustomerType = false;
  customerTypeOptions: { label: string; value: number }[] = [
    { label: 'All Customers', value: 1 },
    { label: 'Visitor', value: 2 },
    { label: 'VIP', value: 3 },
    { label: 'Regular', value: 4 }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sitesService: SitesService,
    private companiesService: CompaniesService,
    private gatesService: GatesService,
    private servicesService: ServicesService,
    private sitesServicesService: SitesServicesService,
    private pricingsService: PricingsService,
    private notificationTemplatesService: NotificationTemplatesService,
    private customerTypesService: CustomerTypesService,
    private fb: FormBuilder
  ) {
    this.addGateForm = this.fb.group({
      gateName: ['', Validators.required],
      status: [1, Validators.required]
    });

    this.addServicesForm = this.fb.group({
      services: this.fb.array([])
    });

    this.gatePricingForm = this.fb.group({
      gateId: ['', Validators.required],
      customerType: [this.getDefaultCustomerTypeValue(), Validators.required],
      pricingType: [1, Validators.required], // Default to Fixed Amount
      fixedAmount: [0], // Fixed Amount input
      hourlyRate: [0], // Hourly Rate input
      maxDailyRate: [0], // Max Daily Rate input
      valetPricingEnabled: [false],
      parkingPricingEnabled: [false],
      parkingPricingType: [1],
      parkingDailyRate: [0],
      parkingHourlyRate: [0],
      parkingMaxDailyRate: [0],
      freeHours: ['', Validators.required],
      days: [
        { label: 'Sat', value: 0, checked: false },
        { label: 'Sun', value: 1, checked: false },
        { label: 'Mon', value: 2, checked: false },
        { label: 'Tue', value: 3, checked: false },
        { label: 'Wed', value: 4, checked: false },
        { label: 'Thu', value: 5, checked: false },
        { label: 'Fri', value: 6, checked: false }
      ]
    });

    // Notification Template Form
    this.notificationTemplateForm = this.fb.group({
      channel: [1, Validators.required], // Default to SMS (1)
      messageType: ['', Validators.required],
      messageTemplate: ['', Validators.required],
      status: [null, Validators.required]
    });

    this.customerTypeForm = this.fb.group({
      name: ['', Validators.required]
    });

    // Watch for pricing type changes to update validators
    this.gatePricingForm.get('pricingType')?.valueChanges.subscribe(pricingType => {
      // Update current pricing type for change detection
      this.currentPricingType = pricingType !== null && pricingType !== undefined ? Number(pricingType) : 1;
      this.updatePricingFieldValidators();
    });

    // Watch for toggle changes to update validators
    this.gatePricingForm.get('valetPricingEnabled')?.valueChanges.subscribe(enabled => {
      if (!enabled) {
        this.gatePricingForm.patchValue({ pricingType: 1 });
      }
      this.updatePricingFieldValidators();
    });

    this.gatePricingForm.get('parkingPricingEnabled')?.valueChanges.subscribe(enabled => {
      if (!enabled) {
        this.gatePricingForm.patchValue({ parkingPricingType: 1 });
      }
      this.updateParkingPricingValidators();
    });

    this.gatePricingForm.get('parkingPricingType')?.valueChanges.subscribe(() => {
      this.updateParkingPricingValidators();
    });

    // Set initial validators for fixedAmount since pricing type defaults to 1
    this.updatePricingFieldValidators();
    this.updateParkingPricingValidators();
  }

  get servicesArray(): FormArray {
    return this.addServicesForm.get('services') as FormArray;
  }

  private createServiceGroup(service: ServiceDto): FormGroup {
    return this.fb.group({
      id: [service.id],
      name: [service.name || service.serviceName || 'Service'],
      enabled: [false],
      cost: ['']
    });
  }

  ngOnInit() {
    this.loadCompanies();
    this.loadAvailableServices();
    const siteId = this.route.snapshot.paramMap.get('id');
    if (siteId) {
      this.loadSite(Number(siteId));
    } else {
      this.loadError = 'No site ID provided';
      this.isLoading = false;
    }
  }

  private loadAvailableServices() {
    this.isLoadingServices = true;
    this.servicesService.getAllServices().subscribe({
      next: (services) => {
        console.log('Loaded services:', services);
        this.availableServices = services || [];
        console.log('Available services count:', this.availableServices.length);
        // Initialize the form array with available services
        this.servicesArray.clear();
        if (this.availableServices.length > 0) {
          this.availableServices.forEach((service, index) => {
            const serviceGroup = this.createServiceGroup(service);
            this.servicesArray.push(serviceGroup);
            console.log(`Added service ${index}:`, service, 'FormGroup:', serviceGroup.value);
          });
        }
        console.log('FormArray controls count:', this.servicesArray.controls.length);
        this.isLoadingServices = false;
      },
      error: (error) => {
        console.error('Failed to load services', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        this.availableServices = [];
        this.servicesArray.clear();
        this.isLoadingServices = false;
      }
    });
  }

  private loadCompanies() {
    this.companiesService.getAllCompanies().subscribe({
      next: (companies: CompanyDto[]) => {
        this.companyOptions = companies.map(company => ({
          id: company.id ?? 0,
          label: company.name ?? company.shortName ?? 'Unnamed Company'
        }));
      },
      error: (error) => {
        console.error('Failed to load companies', error);
      }
    });
  }

  private loadSite(siteId: number) {
    this.sitesService.getAllSites().subscribe({
      next: (sites) => {
        const foundSite = sites.find(s => s.id === siteId);
        if (foundSite) {
          // Enrich with company name
          const company = this.companyOptions.find(c => c.id === foundSite.companyId);
          this.site = {
            ...foundSite,
            companyName: foundSite.companyName ?? company?.label ?? ''
          };
          this.loadCustomerTypesForSite(this.site.id ?? foundSite.id ?? siteId);
        } else {
          this.loadError = 'Site not found';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load site', error);
        this.loadError = 'Failed to load site details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/settings/sites']);
  }

  editSite() {
    if (this.site?.id) {
      this.router.navigate(['/settings/sites'], { 
        queryParams: { edit: this.site.id } 
      });
    }
  }

  setActiveTab(tab: TabName) {
    this.activeTab = tab;
  }

  onExport() {
    console.log('Export clicked');
    // Implement export functionality
  }

  onExportPricing() {
    if (this.sitePricingTabComponent) {
      this.sitePricingTabComponent.onExport();
    }
  }

  onAddGatePricing() {
    this.loadGatesForPricing();
    this.ensureGatePricingCustomerTypeValue();
    // Ensure days are initialized
    const defaultDays = [
      { label: 'Sat', value: 0, checked: false },
      { label: 'Sun', value: 1, checked: false },
      { label: 'Mon', value: 2, checked: false },
      { label: 'Tue', value: 3, checked: false },
      { label: 'Wed', value: 4, checked: false },
      { label: 'Thu', value: 5, checked: false },
      { label: 'Fri', value: 6, checked: false }
    ];
    this.gatePricingForm.patchValue({ days: defaultDays });
    // Initialize current pricing type
    const pricingType = this.gatePricingForm.get('pricingType')?.value;
    this.currentPricingType = pricingType !== null && pricingType !== undefined ? Number(pricingType) : 1;
    this.showGatePricingDrawer = true;
    this.lockBodyScroll();
  }

  closeGatePricingDrawer() {
    this.showGatePricingDrawer = false;
    this.unlockBodyScroll();
    this.gatePricingForm.reset({
      pricingType: 1,
      customerType: this.getDefaultCustomerTypeValue(),
      fixedAmount: 0,
      hourlyRate: 0,
      maxDailyRate: 0,
      valetPricingEnabled: false,
      parkingPricingEnabled: false,
      parkingPricingType: 1,
      parkingDailyRate: 0,
      parkingHourlyRate: 0,
      parkingMaxDailyRate: 0,
      days: [
        { label: 'Sat', value: 0, checked: false },
        { label: 'Sun', value: 1, checked: false },
        { label: 'Mon', value: 2, checked: false },
        { label: 'Tue', value: 3, checked: false },
        { label: 'Wed', value: 4, checked: false },
        { label: 'Thu', value: 5, checked: false },
        { label: 'Fri', value: 6, checked: false }
      ]
    });
    // Reset current pricing type
    this.currentPricingType = 1;
    // Reset validators after form reset
    this.updatePricingFieldValidators();
    this.updateParkingPricingValidators();
  }

  loadGatesForPricing() {
    if (!this.site?.id) return;
    
    this.isLoadingGates = true;
    this.gatesService.getAllGates().subscribe({
      next: (gates) => {
        const siteGates = gates.filter(gate => {
          const gateSiteId = typeof gate.siteId === 'string' 
            ? parseInt(gate.siteId, 10) 
            : gate.siteId;
          return gateSiteId === this.site?.id;
        });
        
        this.availableGates = siteGates.map(gate => ({
          id: gate.id || 0,
          name: gate.gateName || gate.name || 'Unknown Gate'
        }));
        this.isLoadingGates = false;
      },
      error: (error) => {
        console.error('Failed to load gates:', error);
        this.availableGates = [];
        this.isLoadingGates = false;
      }
    });
  }

  get daysArray() {
    const days = this.gatePricingForm.get('days')?.value;
    if (Array.isArray(days) && days.length > 0) {
      return days;
    }
    // Return default days if not set
    return [
      { label: 'Sat', value: 0, checked: false },
      { label: 'Sun', value: 1, checked: false },
      { label: 'Mon', value: 2, checked: false },
      { label: 'Tue', value: 3, checked: false },
      { label: 'Wed', value: 4, checked: false },
      { label: 'Thu', value: 5, checked: false },
      { label: 'Fri', value: 6, checked: false }
    ];
  }

  get pricingType(): number {
    return this.currentPricingType;
  }

  get isFixedAmount(): boolean {
    return this.isValetPricingEnabled() && this.currentPricingType === 1;
  }

  get isHourlyRate(): boolean {
    return this.isValetPricingEnabled() && this.currentPricingType === 2;
  }

  get isParkingFixedAmount(): boolean {
    return this.isParkingPricingEnabled() && (Number(this.gatePricingForm.get('parkingPricingType')?.value) || 1) === 1;
  }

  get isParkingHourlyRate(): boolean {
    return this.isParkingPricingEnabled() && (Number(this.gatePricingForm.get('parkingPricingType')?.value) || 1) === 2;
  }

  trackByDayIndex(index: number, day: any): any {
    return day?.value ?? index;
  }

  onPricingTypeChange() {
    // Update the current pricing type when the form control changes
    const value = this.gatePricingForm.get('pricingType')?.value;
    this.currentPricingType = value !== null && value !== undefined ? Number(value) : 1;
    this.updatePricingFieldValidators();
  }

  selectAllDays() {
    const days = this.gatePricingForm.get('days')?.value || [];
    const allSelected = Array.isArray(days) && days.every((day: any) => day?.checked);
    const updatedDays = Array.isArray(days) ? days.map((day: any) => ({ ...day, checked: !allSelected })) : [];
    this.gatePricingForm.patchValue({ days: updatedDays });
  }

  toggleDay(index: number) {
    const days = this.gatePricingForm.get('days')?.value || [];
    if (!Array.isArray(days)) return;
    const updatedDays = [...days];
    if (updatedDays[index]) {
      updatedDays[index] = { ...updatedDays[index], checked: !updatedDays[index].checked };
      this.gatePricingForm.patchValue({ days: updatedDays });
    }
  }

  submitGatePricing() {
    if (this.gatePricingForm.invalid) {
      this.gatePricingForm.markAllAsTouched();
      return;
    }

    this.isSavingGatePricing = true;
    const formValue = this.gatePricingForm.value;
    
    // Extract free hours number from string (e.g., "30 Minutes" -> 30)
    const freeHoursMatch = formValue.freeHours?.match(/\d+/);
    const freeHours = freeHoursMatch ? parseInt(freeHoursMatch[0], 10) : 0;

    // Ensure days is always an array
    const rawDays = Array.isArray(formValue.days) ? formValue.days : [];
    const selectedDays = rawDays
      .filter((day: any) => day && day.checked)
      .map((day: any) => day.value);
    const effectiveDays = selectedDays.length > 0
      ? selectedDays
      : rawDays.map((day: any) => day && day.value).filter((val: any) => val !== undefined);

    // Map pricing type to determine which rates to use
    const pricingType = formValue.pricingType || 1;
    let dailyRate = 0;
    let hourlyRate = 0;
    let dailyMaxRate = 0;

    // Get fixed amount value if pricing type is Fixed Amount
    const fixedAmount = formValue.fixedAmount 
      ? (typeof formValue.fixedAmount === 'string' ? parseFloat(formValue.fixedAmount) : formValue.fixedAmount)
      : 0;

    // Get hourly rate values if pricing type is Hourly Rate
    const hourlyRateValue = formValue.hourlyRate 
      ? (typeof formValue.hourlyRate === 'string' ? parseFloat(formValue.hourlyRate) : formValue.hourlyRate)
      : 0;
    
    const maxDailyRateValue = formValue.maxDailyRate 
      ? (typeof formValue.maxDailyRate === 'string' ? parseFloat(formValue.maxDailyRate) : formValue.maxDailyRate)
      : 0;

    if (pricingType === 1) {
      // Fixed Amount - use fixedAmount as dailyRate
      dailyRate = fixedAmount || 0;
      hourlyRate = 0;
      dailyMaxRate = 0;
    } else if (pricingType === 2) {
      // Hourly Rate - use hourlyRate and maxDailyRate fields
      hourlyRate = hourlyRateValue || 0;
      dailyMaxRate = maxDailyRateValue || 0;
      dailyRate = 0;
    }

    // Create weekDayPricings array from selected days
    // Use the same pricing values for all selected days
    const weekDayPricings: WeekDayPricing[] = effectiveDays.map((dayOfWeek: number) => ({
      weekDayPricingType: pricingType,
      dayOfWeek: dayOfWeek,
      hourlyRate: hourlyRate,
      dailyRate: dailyRate,
      freeHours: freeHours,
      dailyMaxRate: dailyMaxRate
    }));

    // Map customer type - ensure it's a number
    // Guest = 1, Visitor = 2
    let customerType = formValue.customerType;
    if (typeof customerType === 'string') {
      customerType = parseInt(customerType, 10) || 1;
    }
    customerType = Number(customerType) || 1; // Default to Guest (1) if invalid

    const parkingEnabled = formValue.parkingPricingEnabled || false;
    const parkingPricingType = parkingEnabled ? (Number(formValue.parkingPricingType) || 1) : 1;
    let parkingDailyRateValue = 0;
    let parkingHourlyRateValue = 0;

    if (parkingEnabled) {
      if (parkingPricingType === 1) {
        parkingDailyRateValue = formValue.parkingDailyRate
          ? (typeof formValue.parkingDailyRate === 'string' ? parseFloat(formValue.parkingDailyRate) : formValue.parkingDailyRate)
          : 0;
      } else if (parkingPricingType === 2) {
        parkingHourlyRateValue = formValue.parkingHourlyRate
          ? (typeof formValue.parkingHourlyRate === 'string' ? parseFloat(formValue.parkingHourlyRate) : formValue.parkingHourlyRate)
          : 0;
        parkingDailyRateValue = formValue.parkingMaxDailyRate
          ? (typeof formValue.parkingMaxDailyRate === 'string' ? parseFloat(formValue.parkingMaxDailyRate) : formValue.parkingMaxDailyRate)
          : 0;
      }
    }

    const payload: CreateGatePricingPayload = {
      id: {
        gateId: formValue.gateId
      },
      enableValetPricing: !!formValue.valetPricingEnabled,
      enableParkingPricing: parkingEnabled,
      pricing: {
        siteId: this.site?.id || 0,
        customerType: customerType as number,
        pricingType: pricingType,
        dailyRate: dailyRate,
        freeHours: freeHours,
        hourlyRate: hourlyRate,
        dailyMaxRate: dailyMaxRate,
        parkingEnabled: parkingEnabled,
        parkingPricingType: parkingPricingType,
        parkingDailyRate: parkingDailyRateValue,
        parkingFreeHours: parkingEnabled ? freeHours : 0,
        parkingHourlyRate: parkingHourlyRateValue,
        applyToAllGates: true,
        weekDayBasedEnabled: weekDayPricings.length > 0,
        weekDayPricings: weekDayPricings
      }
    };

    console.log('Gate pricing payload:', payload);

    this.pricingsService.createGatePricing(payload).subscribe({
      next: (response) => {
        console.log('Gate pricing created successfully:', response);
        this.isSavingGatePricing = false;
        this.showNotification('Gate pricing saved successfully', 'success');
        this.closeGatePricingDrawer();
        // Reload the pricing per gate tab
        if (this.pricingPerGateTabComponent) {
          this.pricingPerGateTabComponent.loadPricingData();
        }
      },
      error: (error) => {
        console.error('Failed to create gate pricing:', error);
        this.isSavingGatePricing = false;
        this.showNotification('Failed to save gate pricing. Please try again.', 'error');
      }
    });
  }

  onAddBasePricing() {
    this.showBasePricingDrawer = true;
  }

  onCloseBasePricingDrawer() {
    this.showBasePricingDrawer = false;
    this.editPricingData = null;
  }

  onEditBasePricing(pricingRow: any) {
    console.log('Edit base pricing:', pricingRow);
    this.editPricingData = pricingRow;
    this.showBasePricingDrawer = true;
  }

  onSaveBasePricing(data: any) {
    console.log('Save base pricing:', data);
    // Reload pricing table after successful save
    if (data?.success && this.sitePricingTabComponent?.pricingTableComponent) {
      this.sitePricingTabComponent.pricingTableComponent.reload();
    }
    this.showBasePricingDrawer = false;
    this.editPricingData = null;
  }

  onAddGates() {
    this.showAddGateDrawer = true;
    this.lockBodyScroll();
    this.addGateForm.reset({
      gateName: '',
      status: 1
    });
  }

  onAddService() {
    // Always reload services to ensure we have the latest data
    this.showAddServicesDrawer = true;
    this.isLoadingServices = true;
    
    this.servicesService.getAllServices().subscribe({
      next: (services) => {
        console.log('Loaded services:', services);
        this.availableServices = services || [];
        console.log('Available services count:', this.availableServices.length);
        
        // Initialize the form array with available services
        this.servicesArray.clear();
        if (this.availableServices.length > 0) {
          this.availableServices.forEach((service, index) => {
            const serviceGroup = this.createServiceGroup(service);
            this.servicesArray.push(serviceGroup);
            console.log(`Added service ${index}:`, service, 'FormGroup:', serviceGroup.value);
          });
        }
        console.log('FormArray controls count:', this.servicesArray.controls.length);
        this.isLoadingServices = false;
        this.resetServicesForm();
      },
      error: (error) => {
        console.error('Failed to load services', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        this.availableServices = [];
        this.servicesArray.clear();
        this.isLoadingServices = false;
        alert('Failed to load services. Please check the console for details.');
      }
    });
  }

  private resetServicesForm() {
    // Reset form
    if (this.servicesArray.controls.length > 0) {
      this.servicesArray.controls.forEach(control => {
        control.patchValue({
          enabled: false,
          cost: ''
        });
      });
    }
  }

  onCostInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const control = this.servicesArray.at(index);
    const enabled = control.get('enabled')?.value;
    
    if (enabled) {
      // Only allow numbers
      const value = input.value.replace(/[^0-9]/g, '');
      control.patchValue({ cost: value }, { emitEvent: false });
      input.value = value;
    } else {
      // Prevent input when disabled
      input.value = 'SAR';
    }
  }

  onCostFocus(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const control = this.servicesArray.at(index);
    const enabled = control.get('enabled')?.value;
    
    if (enabled) {
      const currentValue = control.get('cost')?.value;
      if (!currentValue || currentValue === 'SAR') {
        input.value = '';
        control.patchValue({ cost: '' }, { emitEvent: false });
      }
    }
  }

  onCostBlur(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const control = this.servicesArray.at(index);
    const enabled = control.get('enabled')?.value;
    const costValue = control.get('cost')?.value;
    
    if (!enabled || !costValue) {
      control.patchValue({ cost: '' }, { emitEvent: false });
    }
  }

  onCheckboxChange(index: number, event: Event) {
    const control = this.servicesArray.at(index);
    const checkbox = event.target as HTMLInputElement;
    const enabled = checkbox.checked;
    
    if (!enabled) {
      // Checkbox unchecked - clear cost
      control.patchValue({ cost: '' }, { emitEvent: false });
    } else {
      // Checkbox checked - clear cost for user input
      control.patchValue({ cost: '' }, { emitEvent: false });
      // Focus the input after a short delay to ensure it's rendered
      setTimeout(() => {
        const row = (event.target as HTMLElement).closest('.service-row');
        const costInput = row?.querySelector('input[formControlName="cost"]') as HTMLInputElement;
        if (costInput) {
          costInput.focus();
        }
      }, 0);
    }
  }

  closeAddServicesDrawer() {
    if (this.isSavingServices) return;
    this.showAddServicesDrawer = false;
  }

  submitAddServices() {
    if (this.isSavingServices) return;

    if (!this.site?.id) {
      console.error('No site ID available');
      return;
    }

    this.isSavingServices = true;

    const formValue = this.addServicesForm.value;
    const selectedServices = formValue.services.filter((s: any) => {
      const hasValidCost = s.cost && s.cost !== 'SAR' && !isNaN(Number(s.cost)) && Number(s.cost) > 0;
      return s.enabled && hasValidCost;
    });

    if (selectedServices.length === 0) {
      this.showNotification('Please select at least one service and enter a cost.', 'error');
      this.isSavingServices = false;
      return;
    }

    // Create payload for each selected service
    const apiCalls = selectedServices.map((service: any) => {
      const payload: CreateSiteServicePayload = {
        siteId: this.site!.id!,
        serviceId: service.id,
        amount: Number(service.cost)
      };
      console.log('Creating site service with payload:', payload);
      return this.sitesServicesService.createSiteService(payload);
    });

    // Execute all API calls in parallel
    forkJoin(apiCalls).subscribe({
      next: (responses) => {
        console.log('Services created successfully:', responses);
        this.isSavingServices = false;
        this.showAddServicesDrawer = false;
        // Reload extra services in the tab
        if (this.extraServicesTabComponent) {
          this.extraServicesTabComponent.loadServices();
        }
        this.showNotification('Extra services added successfully!', 'success');
      },
      error: (error) => {
        console.error('Failed to create services:', error);
        this.isSavingServices = false;
        this.showNotification('Failed to add services. Please try again.', 'error');
      }
    });
  }

  closeAddGateDrawer() {
    if (this.isSavingGate) return;
    this.showAddGateDrawer = false;
    this.unlockBodyScroll();
  }

  ngOnChanges(changes: SimpleChanges) {
    // This lifecycle hook is here for consistency, but we handle changes manually
    // since showAddGateDrawer is not an @Input
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

  submitAddGate() {
    if (this.isSavingGate) return;

    if (this.addGateForm.invalid) {
      this.addGateForm.markAllAsTouched();
      return;
    }

    if (!this.site?.id) {
      console.error('No site ID available');
      return;
    }

    this.isSavingGate = true;

    const formValue = this.addGateForm.value;

    const payload: CreateGatePayload = {
      id: 0,
      name: formValue.gateName,
      siteId: this.site.id,
      status: Number(formValue.status)
    };

    this.gatesService.createGate(payload).subscribe({
      next: (response) => {
        console.log('Gate created successfully:', response);
        
        // Reload gates in the gates tab component
        if (this.gatesTabComponent) {
          this.gatesTabComponent.loadGates();
        }
        
        this.isSavingGate = false;
        this.showAddGateDrawer = false;
        this.unlockBodyScroll();
      },
      error: (error) => {
        console.error('Failed to create gate:', error);
        this.isSavingGate = false;
        this.showNotification('Failed to create gate. Please try again.', 'error');
      }
    });
  }

  getStatusClass(status: any): string {
    if (typeof status === 'number') {
      return status === 1 ? 'active' : 'inactive';
    }
    if (typeof status === 'string') {
      const normalized = status.toLowerCase();
      if (normalized === '1' || normalized === 'active') {
        return 'active';
      }
    }
    return 'inactive';
  }

  getStatusLabel(status: any): string {
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
      return status;
    }
    return 'Inactive';
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;

    setTimeout(() => {
      this.notificationMessage = null;
    }, 3000);
  }

  private isValetPricingEnabled(): boolean {
    return !!this.gatePricingForm.get('valetPricingEnabled')?.value;
  }

  private isParkingPricingEnabled(): boolean {
    return !!this.gatePricingForm.get('parkingPricingEnabled')?.value;
  }

  private updatePricingFieldValidators(): void {
    const pricingTypeControl = this.gatePricingForm.get('pricingType');
    const fixedAmountControl = this.gatePricingForm.get('fixedAmount');
    const hourlyRateControl = this.gatePricingForm.get('hourlyRate');
    const maxDailyRateControl = this.gatePricingForm.get('maxDailyRate');

    if (!this.isValetPricingEnabled()) {
      pricingTypeControl?.clearValidators();
      pricingTypeControl?.setValue(1, { emitEvent: false });
      pricingTypeControl?.updateValueAndValidity({ emitEvent: false });
      fixedAmountControl?.clearValidators();
      fixedAmountControl?.setValue(0);
      hourlyRateControl?.clearValidators();
      hourlyRateControl?.setValue(0);
      maxDailyRateControl?.clearValidators();
      maxDailyRateControl?.setValue(0);
      fixedAmountControl?.updateValueAndValidity({ emitEvent: false });
      hourlyRateControl?.updateValueAndValidity({ emitEvent: false });
      maxDailyRateControl?.updateValueAndValidity({ emitEvent: false });
      return;
    }

    pricingTypeControl?.setValidators([Validators.required]);
    pricingTypeControl?.updateValueAndValidity({ emitEvent: false });

    const pricingType = this.gatePricingForm.get('pricingType')?.value ?? 1;
    if (pricingType === 1) {
      fixedAmountControl?.setValidators([Validators.required, Validators.min(0)]);
      fixedAmountControl?.updateValueAndValidity();
      hourlyRateControl?.clearValidators();
      hourlyRateControl?.setValue(0);
      hourlyRateControl?.updateValueAndValidity();
      maxDailyRateControl?.clearValidators();
      maxDailyRateControl?.setValue(0);
      maxDailyRateControl?.updateValueAndValidity();
    } else if (pricingType === 2) {
      hourlyRateControl?.setValidators([Validators.required, Validators.min(0)]);
      hourlyRateControl?.updateValueAndValidity();
      maxDailyRateControl?.setValidators([Validators.required, Validators.min(0)]);
      maxDailyRateControl?.updateValueAndValidity();
      fixedAmountControl?.clearValidators();
      fixedAmountControl?.setValue(0);
      fixedAmountControl?.updateValueAndValidity();
    } else {
      fixedAmountControl?.clearValidators();
      fixedAmountControl?.setValue(0);
      fixedAmountControl?.updateValueAndValidity();
      hourlyRateControl?.clearValidators();
      hourlyRateControl?.setValue(0);
      hourlyRateControl?.updateValueAndValidity();
      maxDailyRateControl?.clearValidators();
      maxDailyRateControl?.setValue(0);
      maxDailyRateControl?.updateValueAndValidity();
    }
  }

  private updateParkingPricingValidators(): void {
    const parkingPricingTypeControl = this.gatePricingForm.get('parkingPricingType');
    const parkingDailyRateControl = this.gatePricingForm.get('parkingDailyRate');
    const parkingHourlyRateControl = this.gatePricingForm.get('parkingHourlyRate');
    const parkingMaxDailyRateControl = this.gatePricingForm.get('parkingMaxDailyRate');

    if (!this.isParkingPricingEnabled()) {
      parkingPricingTypeControl?.clearValidators();
      parkingPricingTypeControl?.setValue(1, { emitEvent: false });
      parkingPricingTypeControl?.updateValueAndValidity({ emitEvent: false });

      parkingDailyRateControl?.clearValidators();
      parkingDailyRateControl?.setValue(0);
      parkingDailyRateControl?.updateValueAndValidity({ emitEvent: false });

      parkingHourlyRateControl?.clearValidators();
      parkingHourlyRateControl?.setValue(0);
      parkingHourlyRateControl?.updateValueAndValidity({ emitEvent: false });

      parkingMaxDailyRateControl?.clearValidators();
      parkingMaxDailyRateControl?.setValue(0);
      parkingMaxDailyRateControl?.updateValueAndValidity({ emitEvent: false });
      return;
    }

    parkingPricingTypeControl?.setValidators([Validators.required]);
    parkingPricingTypeControl?.updateValueAndValidity({ emitEvent: false });

    const parkingPricingType = this.gatePricingForm.get('parkingPricingType')?.value ?? 1;
    if (parkingPricingType === 1) {
      parkingDailyRateControl?.setValidators([Validators.required, Validators.min(0)]);
      parkingDailyRateControl?.updateValueAndValidity();
      parkingHourlyRateControl?.clearValidators();
      parkingHourlyRateControl?.setValue(0);
      parkingHourlyRateControl?.updateValueAndValidity({ emitEvent: false });
      parkingMaxDailyRateControl?.clearValidators();
      parkingMaxDailyRateControl?.setValue(0);
      parkingMaxDailyRateControl?.updateValueAndValidity({ emitEvent: false });
    } else if (parkingPricingType === 2) {
      parkingHourlyRateControl?.setValidators([Validators.required, Validators.min(0)]);
      parkingHourlyRateControl?.updateValueAndValidity();
      parkingMaxDailyRateControl?.setValidators([Validators.required, Validators.min(0)]);
      parkingMaxDailyRateControl?.updateValueAndValidity();
      parkingDailyRateControl?.clearValidators();
      parkingDailyRateControl?.setValue(0);
      parkingDailyRateControl?.updateValueAndValidity({ emitEvent: false });
    } else {
      parkingDailyRateControl?.clearValidators();
      parkingDailyRateControl?.setValue(0);
      parkingDailyRateControl?.updateValueAndValidity({ emitEvent: false });
      parkingHourlyRateControl?.clearValidators();
      parkingHourlyRateControl?.setValue(0);
      parkingHourlyRateControl?.updateValueAndValidity({ emitEvent: false });
      parkingMaxDailyRateControl?.clearValidators();
      parkingMaxDailyRateControl?.setValue(0);
      parkingMaxDailyRateControl?.updateValueAndValidity({ emitEvent: false });
    }
  }

  formatValue(value: any, suffix: string = ''): string {
    if (value == null || value === '' || value === 'None' || value === 0) {
      // For percentage, show "None" if empty, for other values show "—"
      if (suffix === '%') {
        return 'None';
      }
      return '—';
    }
    
    if (typeof value === 'number') {
      if (value === 0 && suffix === '%') {
        return 'None';
      }
      return `${value.toLocaleString()}${suffix}`;
    }
    
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'none') {
        return 'None';
      }
      if (suffix && value.includes(suffix)) {
        return value;
      }
      const normalized = value.replace(/[^0-9.-]/g, '');
      if (normalized) {
        const numValue = Number(normalized);
        if (numValue === 0 && suffix === '%') {
          return 'None';
        }
        return `${numValue.toLocaleString()}${suffix}`;
      }
      // If no numeric value found and it's percentage, return "None"
      if (suffix === '%') {
        return 'None';
      }
      return value || '—';
    }
    
    return '—';
  }

  onExportUsers() {
    // TODO: Implement export users functionality
    console.log('Export users');
    alert('Export users functionality will be implemented.');
  }

  onAddCustomerType() {
    this.customerTypeForm.reset({
      name: ''
    });
    this.showCustomerTypeDrawer = true;
    this.lockBodyScroll();
  }

  closeCustomerTypeDrawer() {
    if (this.isSavingCustomerType) return;
    this.showCustomerTypeDrawer = false;
    this.unlockBodyScroll();
    this.customerTypeForm.reset({
      name: ''
    });
  }

  submitCustomerType() {
    if (this.customerTypeForm.invalid) {
      this.customerTypeForm.markAllAsTouched();
      return;
    }

    if (!this.site?.id) {
      this.showNotification('Site information is missing.', 'error');
      return;
    }

    const formValue = this.customerTypeForm.value;
    const trimmedName = (formValue.name || '').trim();
    if (!trimmedName) {
      this.customerTypeForm.get('name')?.setValue('');
      this.customerTypeForm.get('name')?.markAsTouched();
      this.showNotification('Customer type name is required.', 'error');
      return;
    }

    this.isSavingCustomerType = true;

    const payload: CreateCustomerTypePayload = {
      name: trimmedName,
      siteId: this.site.id
    };

    this.customerTypesService.createCustomerType(payload).subscribe({
      next: () => {
        this.isSavingCustomerType = false;
        this.closeCustomerTypeDrawer();
        this.showNotification('Customer type created successfully.', 'success');
        this.customerTypesTabComponent?.reload();
        if (this.site?.id) {
          this.loadCustomerTypesForSite(this.site.id);
        }
      },
      error: (error) => {
        console.error('Failed to create customer type', error);
        this.isSavingCustomerType = false;
        this.showNotification('Failed to create customer type. Please try again.', 'error');
      }
    });
  }

  private loadCustomerTypesForSite(siteId: number | undefined | null): void {
    const numericSiteId = typeof siteId === 'string' ? parseInt(siteId, 10) : siteId;
    if (!numericSiteId) {
      this.customerTypeOptions = this.getDefaultCustomerTypeOptions();
      return;
    }

    this.customerTypesService
      .getPaginatedCustomerTypes({ pageNumber: 1, pageSize: 100 })
      .subscribe({
        next: (response) => {
          const allTypes = response?.data ?? [];
          const filtered = this.filterCustomerTypesBySite(allTypes, numericSiteId);
          const mapped = this.mapCustomerTypesToOptions(filtered);
          this.customerTypeOptions = mapped.length > 0 ? mapped : this.getDefaultCustomerTypeOptions();
          this.ensureGatePricingCustomerTypeValue();
        },
        error: (error) => {
          console.error('Failed to load customer types', error);
          this.customerTypeOptions = this.getDefaultCustomerTypeOptions();
          this.ensureGatePricingCustomerTypeValue();
        }
      });
  }

  private filterCustomerTypesBySite(customerTypes: CustomerTypeDto[], siteId: number): CustomerTypeDto[] {
    return customerTypes.filter((type) => {
      if (type.siteId === undefined || type.siteId === null) {
        return false;
      }
      const typeSiteId = typeof type.siteId === 'string' ? parseInt(type.siteId, 10) : type.siteId;
      return typeSiteId === siteId;
    });
  }

  private mapCustomerTypesToOptions(customerTypes: CustomerTypeDto[]): { label: string; value: number }[] {
    return customerTypes
      .map((type, index) => {
        const value = typeof type.id === 'string' ? parseInt(type.id, 10) : type.id ?? null;
        if (!value || isNaN(value)) {
          return null;
        }
        const label = type.name?.trim() && type.name.trim().length > 0
          ? type.name.trim()
          : `Customer Type ${index + 1}`;
        return { label, value };
      })
      .filter((option): option is { label: string; value: number } => option !== null);
  }

  private getDefaultCustomerTypeOptions(): { label: string; value: number }[] {
    return [
      { label: 'All Customers', value: 1 },
      { label: 'Visitor', value: 2 },
      { label: 'VIP', value: 3 },
      { label: 'Regular', value: 4 }
    ];
  }

  private getDefaultCustomerTypeValue(): number | '' {
    return this.customerTypeOptions[0]?.value ?? '';
  }

  private ensureGatePricingCustomerTypeValue(): void {
    const control = this.gatePricingForm.get('customerType');
    if (!control) return;
    const currentValue = control.value;
    const normalizedValue = typeof currentValue === 'string' ? parseInt(currentValue, 10) : currentValue;
    const hasMatch = this.customerTypeOptions.some(option => option.value === normalizedValue);
    if (!hasMatch) {
      control.setValue(this.getDefaultCustomerTypeValue());
    }
  }

  onExportNotificationTemplates() {
    // TODO: Implement export functionality for notification templates
    console.log('Export notification templates');
  }

  onAddNotificationTemplate() {
    this.openNotificationTemplateDrawer();
  }

  openNotificationTemplateDrawer() {
    this.notificationTemplateForm.reset({
      channel: 1,
      messageType: '',
      messageTemplate: '',
      status: null
    });
    this.showNotificationTemplateDrawer = true;
    this.lockBodyScroll();
  }

  closeNotificationTemplateDrawer() {
    this.showNotificationTemplateDrawer = false;
    this.unlockBodyScroll();
    this.notificationTemplateForm.reset({
      channel: 1,
      messageType: '',
      messageTemplate: '',
      status: null
    });
  }

  submitNotificationTemplate() {
    if (this.notificationTemplateForm.invalid) {
      this.notificationTemplateForm.markAllAsTouched();
      return;
    }

    if (!this.site?.id) {
      alert('Site ID is required');
      return;
    }

    this.isSavingNotificationTemplate = true;
    const formValue = this.notificationTemplateForm.value;

    const payload: CreateNotificationTemplatePayload = {
      siteId: this.site.id,
      channel: Number(formValue.channel),
      messageType: formValue.messageType,
      messageTemplate: formValue.messageTemplate,
      status: Number(formValue.status)
    };

    console.log('Creating notification template with payload:', payload);
    console.log('Request URL:', 'http://localhost:3000/api/notifications-templates/create');

    this.notificationTemplatesService.create(payload).subscribe({
      next: (response: any) => {
        if (response?.isSuccess !== false) {
          // Reload templates in the child component
          if (this.notificationTemplateTabComponent) {
            this.notificationTemplateTabComponent.loadTemplates();
          }
          this.closeNotificationTemplateDrawer();
          this.showNotification('Notification template created successfully', 'success');
        } else {
          alert(response?.message || 'Failed to create template');
          this.isSavingNotificationTemplate = false;
        }
      },
      error: (error: any) => {
        console.error('Failed to create notification template', error);
        alert('Failed to create template. Please try again.');
        this.isSavingNotificationTemplate = false;
      }
    });
  }
}

