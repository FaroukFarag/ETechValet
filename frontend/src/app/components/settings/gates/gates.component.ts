import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GatesService, GateDto } from '../../../services/gates.service';
import { SitesService, SiteDto } from '../../../services/sites.service';

type GateStatus = 'Active' | 'Inactive' | 'Unknown';
type StatusOption = { label: Exclude<GateStatus, 'Unknown'>; value: number };

type GateRow = {
  dto: GateDto;
  id: number;
  gateName: string;
  siteName: string;
  status: GateStatus;
};

@Component({
  selector: 'app-settings-gates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gates.component.html',
  styleUrls: ['./gates.component.scss']
})
export class GatesComponent implements OnInit {
  gates: GateRow[] = [];
  isLoading = false;
  loadError: string | null = null;

  showDrawer = false;
  isSaving = false;
  addGateForm: FormGroup;
  gateOptions = ['Main', 'A1', 'A2', 'B1', 'B2', 'C1'];
  siteOptions: { id: number; name: string }[] = [];
  statusOptions: StatusOption[] = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 2 }
  ];
  openMenuIndex: number | null = null;
  isEditMode = false;
  editingGate: GateRow | null = null;
  showDeleteConfirm = false;
  pendingDeleteGate: GateRow | null = null;

  constructor(
    private gatesService: GatesService,
    private sitesService: SitesService,
    private fb: FormBuilder
  ) {
    this.addGateForm = this.fb.group({
      name: ['', Validators.required],
      siteId: [null, Validators.required],
      status: [1, Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchSites();
    this.fetchGates();
  }

  fetchGates(): void {
    this.isLoading = true;
    this.loadError = null;

    this.gatesService.getAllGates().subscribe({
      next: (data) => {
        this.gates = (data ?? []).map(this.mapDtoToRow);
        this.isLoading = false;
        this.openMenuIndex = null;
      },
      error: (error) => {
        console.error('Failed to load gates', error);
        this.loadError = 'Failed to load gates. Please try again.';
        this.gates = [];
        this.isLoading = false;
      }
    });
  }

  exportGates(): void {
    console.log('Export gates');
  }

  addGate(): void {
    this.showDrawer = true;
    this.isEditMode = false;
    this.editingGate = null;
    this.addGateForm.reset({
      name: '',
      siteId: null,
      status: 1
    });
  }

  closeDrawer(): void {
    if (this.isSaving) return;
    this.showDrawer = false;
    this.isEditMode = false;
    this.editingGate = null;
  }

  submitGate(): void {
    if (this.isSaving) return;

    if (this.addGateForm.invalid) {
      this.addGateForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const payload = {
      id: this.isEditMode && this.editingGate ? this.editingGate.id ?? 0 : 0,
      name: this.addGateForm.value.name,
      siteId: Number(this.addGateForm.value.siteId),
      status: Number(this.addGateForm.value.status)
    };

    const request$ = this.isEditMode
      ? this.gatesService.updateGate(payload)
      : this.gatesService.createGate(payload);

    request$.subscribe({
      next: (response) => {
        console.log(this.isEditMode ? 'Gate updated' : 'Gate created', response);
        this.isSaving = false;
        this.showDrawer = false;
        this.isEditMode = false;
        this.editingGate = null;
        this.fetchGates();
      },
      error: (error) => {
        console.error(this.isEditMode ? 'Failed to update gate' : 'Failed to create gate', error);
        this.isSaving = false;
      }
    });
  }

  openGateActions(gate: GateRow, event: Event): void {
    event.stopPropagation();
    console.log('Gate actions for', gate);
  }

  getStatusClass(status: GateStatus): string {
    if (status === 'Active') return 'active';
    if (status === 'Inactive') return 'inactive';
    return 'unknown';
  }

  private mapDtoToRow = (dto: GateDto): GateRow => {
    const rawStatus = dto.status ?? '';
    let status: GateStatus = 'Unknown';
    if (typeof rawStatus === 'number') {
      if (rawStatus === 1) {
        status = 'Active';
      } else if (rawStatus === 2) {
        status = 'Inactive';
      }
    } else if (typeof rawStatus === 'string') {
      const trimmed = rawStatus.trim();
      const numericValue = Number(trimmed);
      if (!Number.isNaN(numericValue)) {
        if (numericValue === 1) {
          status = 'Active';
        } else if (numericValue === 2) {
          status = 'Inactive';
        }
      } else {
        const normalized = trimmed.toLowerCase();
        if (normalized === 'active') {
          status = 'Active';
        } else if (normalized === 'inactive') {
          status = 'Inactive';
        }
      }
    }

    return {
      dto,
      id: dto.id ?? 0,
      gateName: dto.gateName ?? dto.name ?? dto.code ?? '—',
      siteName: dto.siteName ?? dto.site ?? '—',
      status
    };
  };

  private fetchSites(): void {
    this.sitesService.getAllSites().subscribe({
      next: (sites: SiteDto[]) => {
        this.siteOptions = sites.map(site => ({
          id: site.id ?? 0,
          name: site.siteName ?? site.name ?? 'Unnamed Site'
        }));
      },
      error: (error) => {
        console.error('Failed to load sites for gates drawer', error);
        this.siteOptions = [];
      }
    });
  }

  toggleMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  editGate(gate: GateRow, event?: Event): void {
    event?.stopPropagation();
    this.openMenuIndex = null;
    this.isEditMode = true;
    this.editingGate = gate;
    this.showDrawer = true;

    this.addGateForm.patchValue({
      name: gate.dto.gateName ?? gate.dto.name ?? gate.gateName,
      siteId: gate.dto.siteId ?? this.siteOptions.find(option => option.name === gate.siteName)?.id ?? null,
      status: this.mapStatusToValue(gate.dto.status ?? gate.status) ?? 1
    });
  }

  deleteGate(gate: GateRow, event?: Event): void {
    event?.stopPropagation();
    this.openMenuIndex = null;
    this.pendingDeleteGate = gate;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteGate?.id) {
      this.showDeleteConfirm = false;
      this.pendingDeleteGate = null;
      return;
    }

    const gateId = this.pendingDeleteGate.id;
    this.showDeleteConfirm = false;
    this.pendingDeleteGate = null;
    this.isLoading = true;

    this.gatesService.deleteGate(gateId).subscribe({
      next: (response) => {
        console.log('Gate deleted', response);
        this.fetchGates();
      },
      error: (error) => {
        console.error('Failed to delete gate', error);
        this.isLoading = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.pendingDeleteGate = null;
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.openMenuIndex = null;
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
