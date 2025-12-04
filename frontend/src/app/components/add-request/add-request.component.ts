import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickupRequestsService } from '../../services/pickup-requests.service';
import { SitesService, SiteDto } from '../../services/sites.service';
import { GatesService, GateDto } from '../../services/gates.service';
import { CustomerTypesService, CustomerTypeDto } from '../../services/customer-types.service';
import { UsersRolesService, UserDto } from '../../services/users-roles.service';
import { CardsService, CardDto } from '../../services/cards.service';
import { ShiftsService, ShiftDto } from '../../services/shifts.service';
import { SitesServicesService, SiteServiceDto } from '../../services/sites-services.service';

@Component({
  selector: 'app-add-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-request.component.html',
  styleUrls: ['./add-request.component.scss']
})
export class AddRequestComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  currentStep = 1;
  totalSteps = 3;
  stepLabels = ['Basic Information', 'Vehicle Details', 'Staff Details'];

  siteOptions: { id: number; name: string }[] = [];
  gateOptions: { id: number; name: string }[] = [];
  customerTypeOptions: { label: string; value: number }[] = [];
  cardOptions: { id: number; number: string }[] = [];
  shiftOptions: { id: number; name: string }[] = [];
  selectedSiteId: number | null = null;

  isLoadingSites = false;
  isLoadingGates = false;
  isLoadingCustomerTypes = false;
  isLoadingTeamMembers = false;
  guardMessage: string | null = null;
  guardMessageTimeout: any = null;

  // Step 1: Basic Information
  basicInfo = {
    customerType: '',
    customerMobileNumber: '',
    cardNumber: '',
    siteId: '',
    gateId: '',
    extraService: '',
    paymentType: ''
  };

  // Step 2: Vehicle Details
  vehicleDetails = {
    plateType: '',
    plateNumber: '',
    brand: '',
    color: '',
    notes: ''
  };

  // Step 3: Staff Details
  staffDetails = {
    receivedBy: '',
    parkedBy: '',
    deliveredBy: '',
    shiftId: 1
  };

  // Dropdown options (static data)
  extraServices: { id: number; name: string }[] = [];
  paymentTypes = [
    { label: 'Cash', value: 1 },
    { label: 'Online', value: 2 }
  ];
  plateTypes = [
    { label: 'Saudi', value: 1 },
    { label: 'Other', value: 2 }
  ];
  brands = ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Nissan'];
  colors = ['Silver', 'Black', 'White', 'Red', 'Blue'];
  teamMembersOptions: { id: number; label: string }[] = [];

  uploadedFiles: File[] = [];
  isSubmitting = false;
  submissionError: string | null = null;

  constructor(
    private pickupRequestsService: PickupRequestsService,
    private sitesService: SitesService,
    private gatesService: GatesService,
    private customerTypesService: CustomerTypesService,
    private usersRolesService: UsersRolesService,
    private cardsService: CardsService,
    private shiftsService: ShiftsService,
    private sitesServicesService: SitesServicesService
  ) {}

  ngOnInit() {
    this.loadSites();
    this.loadTeamMembers();
    this.loadShifts();
  }

  closeModal() {
    this.close.emit();
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit() {
    if (this.isSubmitting) {
      return;
    }

    if (
      !this.basicInfo.customerType ||
      !this.basicInfo.customerMobileNumber ||
      !this.vehicleDetails.plateNumber ||
      !this.basicInfo.siteId ||
      !this.basicInfo.gateId
    ) {
      this.submissionError = 'Please complete all required fields before saving.';
      return;
    }

    this.isSubmitting = true;
    this.submissionError = null;

    const formData = new FormData();
    formData.append('plateType', String(this.vehicleDetails.plateType || ''));
    formData.append('plateNumber', this.vehicleDetails.plateNumber || '');
    formData.append('cardNumber', this.basicInfo.cardNumber || '');
    formData.append('customerMobileNumber', this.basicInfo.customerMobileNumber || '');
    formData.append('gateId', String(this.basicInfo.gateId || ''));
    formData.append('customerTypeId', String(this.basicInfo.customerType || ''));
    formData.append('paymentType', String(this.basicInfo.paymentType || ''));
    formData.append('brand', this.vehicleDetails.brand || '');
    formData.append('color', this.vehicleDetails.color || '');
    formData.append('receivedById', String(this.staffDetails.receivedBy || ''));
    formData.append('parkedById', String(this.staffDetails.parkedBy || ''));
    formData.append('deliveredById', String(this.staffDetails.deliveredBy || ''));
    formData.append('shiftId', String(this.staffDetails.shiftId || 1));

    this.uploadedFiles.forEach(file => {
      formData.append('inspectionPhotos', file, file.name);
    });

    this.pickupRequestsService.createRequestWithPhotos(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeModal();
      },
      error: (error) => {
        console.error('Failed to create request', error);
        this.submissionError = error?.error?.message || 'Failed to create request. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.uploadedFiles = Array.from(input.files);
    }
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  onGateFocus() {
    if (!this.basicInfo.siteId) {
      this.showGuardMessage('Please select Site Name first');
    }
  }

  onCustomerTypeFocus() {
    if (!this.basicInfo.siteId) {
      this.showGuardMessage('Please select Site Name first');
    }
  }

  onSiteChange(siteId: string | number) {
    const normalizedId = this.normalizeId(siteId);
    this.selectedSiteId = normalizedId;
    this.basicInfo.siteId = normalizedId ? String(normalizedId) : '';
    this.basicInfo.gateId = '';
    this.basicInfo.customerType = '';
    this.basicInfo.cardNumber = '';
    this.gateOptions = [];
    this.customerTypeOptions = [];
    this.cardOptions = [];

    if (normalizedId) {
      this.loadGateOptions(normalizedId);
      this.loadCustomerTypes(normalizedId);
      this.loadCards(normalizedId);
      this.loadSiteServices(normalizedId);
    }
  }

  private loadSites(): void {
    this.isLoadingSites = true;
    this.sitesService.getAllSites().subscribe({
      next: (sites: SiteDto[]) => {
        this.siteOptions = (sites || [])
          .map(site => ({
            id: site.id ?? 0,
            name: site.siteName || site.name || 'Unnamed Site'
          }))
          .filter(site => site.id);
        this.isLoadingSites = false;
      },
      error: () => {
        this.siteOptions = [];
        this.isLoadingSites = false;
      }
    });
  }

  private loadGateOptions(siteId: number): void {
    this.isLoadingGates = true;
    this.gatesService.getAllGates().subscribe({
      next: (gates: GateDto[]) => {
        this.gateOptions = (gates || [])
          .filter(gate => this.normalizeId(gate.siteId) === siteId)
          .map(gate => ({
            id: gate.id ?? 0,
            name: gate.gateName || gate.name || `Gate ${gate.id ?? ''}`
          }))
          .filter(gate => gate.id);
        this.isLoadingGates = false;
      },
      error: () => {
        this.gateOptions = [];
        this.isLoadingGates = false;
      }
    });
  }

  private loadCustomerTypes(siteId: number): void {
    this.isLoadingCustomerTypes = true;
    this.customerTypesService.getPaginatedCustomerTypes({ pageNumber: 1, pageSize: 200 }).subscribe({
      next: (response) => {
        const types = response?.data ?? [];
        this.customerTypeOptions = types
          .filter((type: CustomerTypeDto) => this.normalizeId(type.siteId) === siteId)
          .map((type: CustomerTypeDto, index) => {
            const id = this.normalizeId(type.id);
            if (!id) {
              return null;
            }
            return {
              label: type.name?.trim() || `Customer Type ${index + 1}`,
              value: id
            };
          })
          .filter((option): option is { label: string; value: number } => option !== null);
        this.isLoadingCustomerTypes = false;
      },
      error: () => {
        this.customerTypeOptions = [];
        this.isLoadingCustomerTypes = false;
      }
    });
  }

  private loadCards(siteId: number): void {
    this.cardsService.getAllCards().subscribe({
      next: (cards: CardDto[]) => {
        this.cardOptions = (cards || [])
          .filter(card => this.normalizeId(card.siteId) === siteId)
          .map(card => ({
            id: card.id ?? 0,
            number: this.formatCardNumber(card)
          }))
          .filter(card => card.id);
        if (!this.cardOptions.length) {
          this.basicInfo.cardNumber = '';
        }
      },
      error: () => {
        this.cardOptions = [];
      }
    });
  }

  private loadShifts(): void {
    this.shiftsService.getAllShifts().subscribe({
      next: (shifts: ShiftDto[]) => {
        this.shiftOptions = (shifts || [])
          .map(shift => ({
            id: shift.id ?? 0,
            name: shift.name || shift.shiftName || `Shift ${shift.id ?? ''}`
          }))
          .filter(shift => shift.id);
      },
      error: () => {
        this.shiftOptions = [];
      }
    });
  }

  private loadTeamMembers(): void {
    this.isLoadingTeamMembers = true;
    this.usersRolesService.getTeamMembers().subscribe({
      next: (response) => {
        const data: UserDto[] = response?.data ?? [];
        this.teamMembersOptions = data
          .map(user => {
            const id = this.normalizeId(user.id);
            if (!id) {
              return null;
            }
            const name = user.name || user.fullName || user.userName || user.username || 'Team Member';
            return { id, label: name };
          })
          .filter((option): option is { id: number; label: string } => option !== null);
        this.isLoadingTeamMembers = false;
      },
      error: () => {
        this.teamMembersOptions = [];
        this.isLoadingTeamMembers = false;
      }
    });
  }

  private loadSiteServices(siteId: number): void {
    this.sitesServicesService.getPaginatedSiteServices({ pageNumber: 1, pageSize: 500 }).subscribe({
      next: (response) => {
        const services = response?.data ?? [];
        this.extraServices = services
          .filter((service: SiteServiceDto) => this.normalizeId(service.siteId) === siteId)
          .map((service: SiteServiceDto, index) => {
            const id = service.serviceId ?? service.id ?? index;
            const name = service.serviceName || service.name || `Service ${index + 1}`;
            return { id, name };
          });
        if (!this.extraServices.length) {
          this.basicInfo.extraService = '';
        }
      },
      error: (error) => {
        console.error('Failed to load site services', error);
        this.extraServices = [];
        this.basicInfo.extraService = '';
      }
    });
  }

  private normalizeId(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    const numeric = typeof value === 'string' ? parseInt(value, 10) : value;
    return Number.isNaN(numeric) ? null : numeric;
  }

  private formatCardNumber(card: CardDto): string {
    if (card.cardNumber && typeof card.cardNumber === 'string') {
      return card.cardNumber;
    }
    if (card.number !== undefined && card.number !== null) {
      return String(card.number);
    }
    return `Card ${card.id ?? ''}`;
  }

  private showGuardMessage(message: string) {
    this.guardMessage = message;
    if (this.guardMessageTimeout) {
      clearTimeout(this.guardMessageTimeout);
    }
    this.guardMessageTimeout = setTimeout(() => {
      this.guardMessage = null;
    }, 2500);
  }
}


