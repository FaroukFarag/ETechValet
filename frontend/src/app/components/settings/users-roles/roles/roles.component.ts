import { Component, HostListener, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRolesService, RoleDto, PaginatedRolesResponse } from '../../../../services/users-roles.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

type RoleRow = {
  id: number;
  role: string;
};

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit, OnChanges {
  @Input() triggerExport: number = 0;

  roles: RoleRow[] = [];
  isLoadingRoles = false;
  loadRolesError: string | null = null;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;
  totalCount = 0;
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' = 'success';

  openRoleMenuIndex: number | null = null;
  showRoleModal = false;
  roleForm: FormGroup;
  isSavingRole = false;
  isEditRoleMode = false;
  editingRole: RoleRow | null = null;
  showRoleDeleteConfirm = false;
  pendingDeleteRole: RoleRow | null = null;
  
  private lastTriggerExport = 0;

  constructor(private usersRolesService: UsersRolesService, private fb: FormBuilder) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      permissions: this.fb.group({
        receiveCar: [false],
        deliverCar: [false],
        editPricing: [false],
        viewPricing: [false],
        dashboard: [false],
        requests: [false],
        receipts: [false],
        services: [false],
        settings: [false],
        sites: [false],
        companies: [false],
        assignRole: [false]
      })
    });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['triggerExport'] && this.triggerExport !== this.lastTriggerExport) {
      this.lastTriggerExport = this.triggerExport;
      this.exportRoles();
    }
  }

  exportRoles(): void {
    console.log('Export roles');
  }

  toggleRoleMenu(index: number, event: Event): void {
    event.stopPropagation();
    this.openRoleMenuIndex = this.openRoleMenuIndex === index ? null : index;
  }

  editRole(row: RoleRow, event?: Event): void {
    event?.stopPropagation();
    this.isEditRoleMode = true;
    this.editingRole = row;
    this.openRoleMenuIndex = null;
    this.showRoleModal = true;
    this.roleForm.patchValue({
      name: row.role
    });
  }

  deleteRole(row: RoleRow, event?: Event): void {
    event?.stopPropagation();
    this.openRoleMenuIndex = null;
    this.pendingDeleteRole = row;
    this.showRoleDeleteConfirm = true;
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.openRoleMenuIndex = null;
  }

  closeRoleModal(): void {
    if (this.isSavingRole) return;
    this.showRoleModal = false;
  }

  submitRole(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    this.isSavingRole = true;
    const payload = {
      id: this.isEditRoleMode && this.editingRole ? this.editingRole.id : undefined,
      name: this.roleForm.value.name
    };

    const request$ = this.isEditRoleMode
      ? this.usersRolesService.updateRole(payload as RoleDto)
      : this.usersRolesService.createRole({ name: payload.name });

    request$.subscribe({
      next: (response) => {
        console.log(this.isEditRoleMode ? 'Role updated' : 'Role created', response);
        
        if (response?.isSuccess === false) {
          this.showNotification(response.message || 'Operation failed', 'error');
          this.isSavingRole = false;
        } else {
          this.showNotification(
            this.isEditRoleMode ? 'Role updated successfully' : 'Role created successfully',
            'success'
          );
          this.loadRoles();
          this.isSavingRole = false;
          this.showRoleModal = false;
          this.roleForm.reset();
          this.isEditRoleMode = false;
          this.editingRole = null;
        }
      },
      error: (error) => {
        console.error(this.isEditRoleMode ? 'Failed to update role' : 'Failed to create role', error);
        const errorMessage = error?.error?.message || 
                           (this.isEditRoleMode ? 'Failed to update role. Please try again.' : 'Failed to create role. Please try again.');
        this.showNotification(errorMessage, 'error');
        this.isSavingRole = false;
      }
    });
  }

  get pageNumbers(): (number | string)[] {
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

  loadRoles(): void {
    this.isLoadingRoles = true;
    this.loadRolesError = null;

    this.usersRolesService.getPaginatedRoles({
      pageNumber: this.currentPage,
      pageSize: this.itemsPerPage
    }).subscribe({
      next: (response: PaginatedRolesResponse) => {
        console.log('Roles response:', response);
        const rolesData = response.data ?? [];
        this.roles = rolesData.map(role => ({ id: role.id, role: role.name }));
        this.totalCount = response.totalCount ?? 0;
        this.totalPages = response.totalPages ?? Math.ceil(this.totalCount / this.itemsPerPage);
        this.isLoadingRoles = false;
        this.openRoleMenuIndex = null;
      },
      error: (error) => {
        console.error('Failed to load roles', error);
        this.loadRolesError = 'Failed to load roles. Please try again.';
        this.roles = [];
        this.totalCount = 0;
        this.totalPages = 0;
        this.isLoadingRoles = false;
      }
    });
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.openRoleMenuIndex = null;
      this.loadRoles();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadRoles();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadRoles();
    }
  }

  confirmDeleteRole(): void {
    if (!this.pendingDeleteRole?.id) {
      this.showRoleDeleteConfirm = false;
      this.pendingDeleteRole = null;
      return;
    }

    const roleId = this.pendingDeleteRole.id;
    this.showRoleDeleteConfirm = false;
    this.pendingDeleteRole = null;

    this.usersRolesService.deleteRole(roleId).subscribe({
      next: (response) => {
        console.log('Role deleted', response);
        
        if (response?.isSuccess === false) {
          this.showNotification(response.message || 'Failed to delete role', 'error');
        } else {
          this.showNotification('Role deleted successfully', 'success');
          this.loadRoles();
        }
      },
      error: (error) => {
        console.error('Failed to delete role', error);
        const errorMessage = error?.error?.message || 'Failed to delete role. Please try again.';
        this.showNotification(errorMessage, 'error');
      }
    });
  }

  cancelDeleteRole(): void {
    this.showRoleDeleteConfirm = false;
    this.pendingDeleteRole = null;
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;

    setTimeout(() => {
      this.notificationMessage = null;
    }, 4000);
  }
}

