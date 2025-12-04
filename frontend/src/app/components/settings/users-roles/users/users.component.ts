import { Component, HostListener, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UsersRolesService, UserDto, PaginatedUsersResponse, RoleDto, CreateUserPayload } from '../../../../services/users-roles.service';

type UserRow = {
  id: number;
  username: string;
  phoneNumber: string;
  role: string;
  email: string;
  passwordHidden: string;
  status: 'Active' | 'Inactive';
};

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnChanges {
  @Input() triggerAdd: number = 0;
  @Input() triggerExport: number = 0;
  @Input() triggerAssignToSite: number = 0;

  users: UserRow[] = [];
  isLoadingUsers = false;
  loadUsersError: string | null = null;
  currentUsersPage = 1;
  itemsPerUsersPage = 10;
  totalUsersPages = 0;
  totalUsersCount = 0;
  selectedUsers: Set<number> = new Set();
  selectAllUsers = false;
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' = 'success';

  showAddUserDrawer = false;
  userForm: FormGroup;
  isSaving = false;
  isEditMode = false;
  editingUser: UserRow | null = null;
  roles: RoleDto[] = [];
  isLoadingRoles = false;
  showPassword = false;
  showConfirmPassword = false;

  private lastTriggerAdd = 0;
  private lastTriggerExport = 0;
  private lastTriggerAssignToSite = 0;

  constructor(
    private usersRolesService: UsersRolesService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      userName: ['', [Validators.required]],
      role: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      status: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator.bind(this)
    });

    // Listen to password and confirmPassword changes to update validation
    this.userForm.get('password')?.valueChanges.subscribe(() => {
      if (this.userForm.get('confirmPassword')?.touched) {
        this.userForm.updateValueAndValidity();
      }
    });

    this.userForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      if (this.userForm.get('password')?.touched) {
        this.userForm.updateValueAndValidity();
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['triggerAdd'] && this.triggerAdd !== this.lastTriggerAdd) {
      this.lastTriggerAdd = this.triggerAdd;
      this.addNewUser();
    }
    if (changes['triggerExport'] && this.triggerExport !== this.lastTriggerExport) {
      this.lastTriggerExport = this.triggerExport;
      this.exportUsers();
    }
    if (changes['triggerAssignToSite'] && this.triggerAssignToSite !== this.lastTriggerAssignToSite) {
      this.lastTriggerAssignToSite = this.triggerAssignToSite;
      this.assignToSite();
    }
  }

  exportUsers(): void {
    console.log('Export users');
  }

  addNewUser(): void {
    this.showAddUserDrawer = true;
    this.isEditMode = false;
    this.editingUser = null;
    this.userForm.reset();
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.preventBodyScroll();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  closeAddUserDrawer(): void {
    if (this.isSaving) return;
    this.showAddUserDrawer = false;
    this.userForm.reset();
    this.isEditMode = false;
    this.editingUser = null;
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.restoreBodyScroll();
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent): void {
    if (this.showAddUserDrawer) {
      this.closeAddUserDrawer();
    }
  }

  private preventBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private restoreBodyScroll(): void {
    document.body.style.overflow = '';
  }

  loadRoles(): void {
    this.isLoadingRoles = true;
    this.usersRolesService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.isLoadingRoles = false;
      },
      error: (error) => {
        console.error('Failed to load roles', error);
        this.isLoadingRoles = false;
      }
    });
  }

  submitUser(): void {
    // Trigger validation for all fields
    this.userForm.markAllAsTouched();

    // Update confirmPassword validation when checking
    this.userForm.get('confirmPassword')?.updateValueAndValidity();

    if (this.userForm.invalid) {
      // Check password mismatch first
      if (this.userForm.errors?.['passwordMismatch']) {
        this.showNotification('Passwords do not match', 'error');
        return;
      }

      // Check individual field errors
      if (this.userForm.get('userName')?.invalid) {
        this.showNotification('Username is required', 'error');
      } else if (this.userForm.get('role')?.invalid) {
        this.showNotification('Role is required', 'error');
      } else if (this.userForm.get('email')?.invalid) {
        if (this.userForm.get('email')?.errors?.['email']) {
          this.showNotification('Please enter a valid email', 'error');
        } else {
          this.showNotification('Email is required', 'error');
        }
      } else if (this.userForm.get('password')?.invalid) {
        if (this.userForm.get('password')?.errors?.['minlength']) {
          this.showNotification('Password must be at least 6 characters', 'error');
        } else {
          this.showNotification('Password is required', 'error');
        }
      } else if (this.userForm.get('confirmPassword')?.invalid) {
        this.showNotification('Please confirm your password', 'error');
      } else if (this.userForm.get('status')?.invalid) {
        this.showNotification('Status is required', 'error');
      }
      return;
    }

    this.isSaving = true;
    const formValue = this.userForm.value;
    
    // Find selected role
    const selectedRole = this.roles.find(role => role.id === parseInt(formValue.role));
    if (!selectedRole) {
      this.isSaving = false;
      this.showNotification('Please select a valid role', 'error');
      return;
    }

    // Prepare payload according to API structure
    const payload: CreateUserPayload = {
      userName: formValue.userName.trim(),
      email: formValue.email.trim(),
      password: formValue.password,
      confirmPassword: formValue.confirmPassword,
      status: formValue.status === 'Active' ? 1 : 0,
      roles: [
        {
          name: selectedRole.name
        }
      ]
    };

    console.log('Creating user with payload:', payload);

    this.usersRolesService.createUser(payload).subscribe({
      next: (response) => {
        console.log('User created successfully', response);
        
        // Check if response indicates success or failure
        if (response?.isSuccess === false) {
          // API returned success: false with an error message
          this.showNotification(response.message || 'Failed to create user', 'error');
          this.isSaving = false;
        } else {
          // Success
          this.showNotification('User created successfully', 'success');
          this.isSaving = false;
          this.closeAddUserDrawer();
          this.loadUsers();
        }
      },
      error: (error) => {
        console.error('Failed to create user', error);
        const errorMessage = error?.error?.message || 
                           error?.message || 
                           (error?.error?.isSuccess === false ? error?.error?.message : 'Failed to create user. Please try again.');
        this.showNotification(errorMessage, 'error');
        this.isSaving = false;
      }
    });
  }

  assignToSite(): void {
    if (this.selectedUsers.size === 0) {
      this.showNotification('Please select at least one user to assign to a site', 'error');
      return;
    }
    console.log('Assign users to site:', Array.from(this.selectedUsers));
    // TODO: Implement assign to site functionality
    this.showNotification('Assign to site functionality will be implemented', 'success');
  }

  toggleSelectAllUsers(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectAllUsers = checked;
    
    if (checked) {
      this.users.forEach(user => this.selectedUsers.add(user.id));
    } else {
      this.selectedUsers.clear();
    }
  }

  toggleUserSelection(userId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    
    if (checked) {
      this.selectedUsers.add(userId);
    } else {
      this.selectedUsers.delete(userId);
    }
    
    // Update select all state
    this.selectAllUsers = this.selectedUsers.size === this.users.length && this.users.length > 0;
  }

  resetPassword(row: UserRow): void {
    console.log('Reset password for user:', row);
    // TODO: Implement reset password functionality
    this.showNotification(`Reset password for ${row.username}`, 'success');
  }

  deactivateAccount(row: UserRow): void {
    console.log('Deactivate/Activate account for user:', row);
    const action = row.status === 'Active' ? 'deactivate' : 'activate';
    // TODO: Implement deactivate/activate account functionality
    this.showNotification(`${action.charAt(0).toUpperCase() + action.slice(1)} account for ${row.username}`, 'success');
  }

  getStatusClass(status: 'Active' | 'Inactive'): string {
    return status.toLowerCase();
  }

  private mapUserDtoToRow(dto: UserDto): UserRow {
    // Map status to Active/Inactive - handle various status formats
    let status: 'Active' | 'Inactive' = 'Inactive';
    if (dto.isActive === true || dto.isActive === 1) {
      status = 'Active';
    } else if (dto.status === 1 || dto.status === '1' || dto.status === 'Active' || dto.status === 'active' || dto.status === 'ACTIVE') {
      status = 'Active';
    } else if (dto.isActive === false || dto.status === 0 || dto.status === '0' || dto.status === 'Inactive' || dto.status === 'inactive' || dto.status === 'INACTIVE') {
      status = 'Inactive';
    }
    
    // Extract username - try multiple possible fields
    const username = dto.username || 
                     (dto as any).userName || 
                     (dto as any).name || 
                     (dto as any).fullName ||
                     (dto.email ? dto.email.split('@')[0] : '') || 
                     '—';
    
    // Extract phone number - try multiple possible fields
    const phoneNumber = dto.phoneNumber || 
                        (dto as any).phone || 
                        (dto as any).phoneNumber || 
                        (dto as any).mobile ||
                        '—';
    
    // Extract role from userRoles array - API returns: userRoles: [{ role: { name: 'Admin' } }]
    let role = '—';
    const userRoles = (dto as any).userRoles;
    if (userRoles && Array.isArray(userRoles) && userRoles.length > 0) {
      // Extract role names from the userRoles array
      const roleNames = userRoles
        .map((ur: any) => ur.role?.name || ur.roleName || ur.name)
        .filter((name: string) => name);
      
      if (roleNames.length > 0) {
        role = roleNames.join(', '); // Join multiple roles with comma
      }
    } else {
      // Fallback to other possible fields
      role = dto.roleName || 
             dto.role || 
             (dto as any).roleName || 
             (dto as any).userRole ||
             '—';
    }
    
    // Extract email - ensure it's properly formatted
    const email = dto.email || 
                  (dto as any).emailAddress || 
                  '—';
    
    return {
      id: dto.id ?? 0,
      username: username,
      phoneNumber: phoneNumber,
      role: role,
      email: email,
      passwordHidden: dto.passwordHidden ?? '********',
      status: status
    };
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.loadUsersError = null;

    this.usersRolesService.getPaginatedUsers({
      pageNumber: this.currentUsersPage,
      pageSize: this.itemsPerUsersPage
    }).subscribe({
      next: (response: PaginatedUsersResponse) => {
        console.log('Users response:', response);
        
        // Check if response indicates failure
        if ((response as any)?.isSuccess === false) {
          const errorMessage = (response as any)?.message || 'Failed to load users';
          this.loadUsersError = errorMessage;
          this.users = [];
          this.totalUsersCount = 0;
          this.totalUsersPages = 0;
          this.isLoadingUsers = false;
          this.showNotification(errorMessage, 'error');
          return;
        }
        
        const usersData = response.data ?? [];
        this.users = usersData.map(dto => this.mapUserDtoToRow(dto));
        this.totalUsersCount = response.totalCount ?? 0;
        this.totalUsersPages = response.totalPages ?? Math.ceil(this.totalUsersCount / this.itemsPerUsersPage);
        this.isLoadingUsers = false;
        
        // Reset selection when loading new page
        this.selectedUsers.clear();
        this.selectAllUsers = false;
        
        // Log mapped users for debugging
        console.log('Mapped users:', this.users);
      },
      error: (error) => {
        console.error('Failed to load users', error);
        const errorMessage = error?.error?.message || 
                           error?.message || 
                           'Failed to load users. Please try again.';
        this.loadUsersError = errorMessage;
        this.users = [];
        this.totalUsersCount = 0;
        this.totalUsersPages = 0;
        this.isLoadingUsers = false;
        this.showNotification(errorMessage, 'error');
      }
    });
  }

  get usersPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const total = this.totalUsersPages;
    const current = this.currentUsersPage;

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

  goToUsersPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalUsersPages) {
      this.currentUsersPage = page;
      this.loadUsers();
    }
  }

  previousUsersPage(): void {
    if (this.currentUsersPage > 1) {
      this.currentUsersPage--;
      this.loadUsers();
    }
  }

  nextUsersPage(): void {
    if (this.currentUsersPage < this.totalUsersPages) {
      this.currentUsersPage++;
      this.loadUsers();
    }
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;

    setTimeout(() => {
      this.notificationMessage = null;
    }, 4000);
  }
}

