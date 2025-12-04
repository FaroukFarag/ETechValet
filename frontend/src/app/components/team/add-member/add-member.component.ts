import { Component, EventEmitter, Output, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SitesService, SiteDto } from '../../../services/sites.service';
import { GatesService, GateDto } from '../../../services/gates.service';
import { UsersRolesService, UserDto, UpdateMemberDataPayload } from '../../../services/users-roles.service';

@Component({
  selector: 'app-add-member',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss']
})
export class AddMemberComponent implements OnInit, AfterViewInit {
  @Output() close = new EventEmitter<void>();
  isOpen = false;

  formData = {
    username: '',
    userId: null as number | null,
    siteName: '',
    siteId: null as number | null,
    workingHours: '8 Hours',
    worksOnAllGates: false,
    selectedGates: [] as number[]
  };

  sites: SiteDto[] = [];
  gates: GateDto[] = [];
  isLoadingGates = false;
  users: UserDto[] = [];
  filteredUsers: UserDto[] = [];
  userSearchTerm = '';
  showUserDropdown = false;
  isLoadingUsers = false;
  isSaving = false;

  constructor(
    private sitesService: SitesService,
    private gatesService: GatesService,
    private usersRolesService: UsersRolesService
  ) {}

  ngOnInit() {
    this.loadSites();
    this.loadUsers();
  }

  loadUsers() {
    this.isLoadingUsers = true;
    // Load all users - you might want to use pagination here if there are many users
    this.usersRolesService.getPaginatedUsers({
      pageNumber: 1,
      pageSize: 100 // Load first 100 users, adjust as needed
    }).subscribe({
      next: (response) => {
        if (response.data) {
          this.users = response.data;
          this.filteredUsers = response.data;
        }
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.users = [];
        this.filteredUsers = [];
        this.isLoadingUsers = false;
      }
    });
  }

  onUserSearch() {
    if (!this.userSearchTerm.trim()) {
      this.filteredUsers = this.users;
      return;
    }

    const searchLower = this.userSearchTerm.toLowerCase().trim();
    this.filteredUsers = this.users.filter(user => {
      const username = (user.username || user.userName || user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      return username.includes(searchLower) || email.includes(searchLower);
    });
  }

  selectUser(user: UserDto) {
    this.formData.userId = user.id || null;
    const username = user.username || user.userName || user.name || '';
    this.formData.username = username;
    this.userSearchTerm = username;
    this.showUserDropdown = false;
    this.filteredUsers = this.users; // Reset filter
  }

  onUserInputFocus() {
    this.showUserDropdown = true;
    if (!this.userSearchTerm.trim()) {
      this.filteredUsers = this.users;
    } else {
      this.onUserSearch();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown-wrapper')) {
      this.showUserDropdown = false;
    }
  }

  ngAfterViewInit() {
    // Trigger animation after view init
    setTimeout(() => {
      this.isOpen = true;
    }, 10);
  }

  loadSites() {
    this.sitesService.getAllSites().subscribe({
      next: (sites) => {
        this.sites = sites;
      },
      error: (error) => {
        console.error('Error loading sites:', error);
      }
    });
  }

  onSiteChange() {
    if (this.formData.siteId) {
      this.loadGatesForSite(this.formData.siteId);
    } else {
      this.gates = [];
      this.formData.selectedGates = [];
      this.formData.worksOnAllGates = false;
    }
  }

  loadGatesForSite(siteId: number | null) {
    if (!siteId) {
      this.gates = [];
      this.formData.selectedGates = [];
      return;
    }

    this.isLoadingGates = true;
    this.gates = [];
    
    this.gatesService.getAllGates().subscribe({
      next: (allGates) => {
        console.log('All gates loaded:', allGates);
        console.log('Filtering for siteId:', siteId);
        
        // Filter gates for the selected site - ensure type consistency
        const siteIdNum = Number(siteId);
        this.gates = allGates.filter(gate => {
          const gateSiteId = gate.siteId ? Number(gate.siteId) : null;
          return gateSiteId === siteIdNum;
        });
        
        console.log('Filtered gates:', this.gates);
        this.isLoadingGates = false;
        
        // If works on all gates is enabled, select all gates
        if (this.formData.worksOnAllGates && this.gates.length > 0) {
          this.formData.selectedGates = this.gates
            .map(gate => gate.id || 0)
            .filter(id => id > 0);
        }
      },
      error: (error) => {
        console.error('Error loading gates:', error);
        this.gates = [];
        this.isLoadingGates = false;
      }
    });
  }

  toggleWorksOnAllGates() {
    this.formData.worksOnAllGates = !this.formData.worksOnAllGates;
    
    if (this.formData.worksOnAllGates) {
      // Select all gates
      this.formData.selectedGates = this.gates.map(gate => gate.id || 0).filter(id => id > 0);
    } else {
      // Deselect all gates
      this.formData.selectedGates = [];
    }
  }

  toggleGateSelection(gateId: number) {
    const index = this.formData.selectedGates.indexOf(gateId);
    if (index > -1) {
      this.formData.selectedGates.splice(index, 1);
    } else {
      this.formData.selectedGates.push(gateId);
    }
    
    // Update "works on all gates" toggle based on selection
    if (this.gates.length > 0) {
      const allGatesSelected = this.gates.every(gate => {
        const id = gate.id || 0;
        return id > 0 && this.formData.selectedGates.includes(id);
      });
      this.formData.worksOnAllGates = allGatesSelected;
    }
  }

  isGateSelected(gateId: number): boolean {
    return this.formData.selectedGates.includes(gateId);
  }

  closePanel() {
    this.close.emit();
  }

  saveMember() {
    // Validate required fields
    if (!this.formData.userId || !this.formData.username) {
      console.error('Please select a user');
      return;
    }

    if (!this.formData.siteId) {
      console.error('Please select a site');
      return;
    }

    if (!this.formData.workingHours) {
      console.error('Please enter working hours');
      return;
    }

    this.isSaving = true;

    // Extract working hours number from string (e.g., "8 Hours" -> 8)
    const workingHoursMatch = this.formData.workingHours.match(/\d+/);
    const workingHours = workingHoursMatch ? parseInt(workingHoursMatch[0], 10) : 8;

    // Map selected gates to the required format
    const userGates = this.formData.selectedGates.map(gateId => ({
      id: {
        gateId: gateId
      }
    }));

    const payload: UpdateMemberDataPayload = {
      userName: this.formData.username,
      siteId: this.formData.siteId,
      phoneNumber: '', // Phone number was removed from form, sending empty string
      workingHours: workingHours,
      userGates: userGates
    };

    console.log('Saving member with payload:', payload);

    this.usersRolesService.updateMemberData(payload).subscribe({
      next: (response) => {
        console.log('Member updated successfully', response);
        this.isSaving = false;
        this.closePanel();
        // Emit event to refresh the team list in parent component
        // The parent component should listen to this and reload users
      },
      error: (error) => {
        console.error('Failed to update member', error);
        this.isSaving = false;
        const errorMessage = error?.error?.message || error?.message || 'Failed to update member. Please try again.';
        alert(errorMessage); // TODO: Replace with proper notification component
      }
    });
  }

  getSelectedSiteName(): string {
    const site = this.sites.find(s => s.id === this.formData.siteId);
    return site?.siteName || site?.name || '';
  }
}

