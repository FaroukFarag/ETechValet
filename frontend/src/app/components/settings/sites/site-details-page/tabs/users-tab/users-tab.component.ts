import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRolesService, UserDto } from '../../../../../../services/users-roles.service';

export interface SiteUserRow {
  id: number;
  username: string;
  phoneNumber: string;
  role: string;
  email: string;
  status: string;
}

@Component({
  selector: 'app-users-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-tab.component.html',
  styleUrls: ['./users-tab.component.scss']
})
export class UsersTabComponent implements OnInit, OnChanges {
  @Input() siteId: number | null = null;

  users: SiteUserRow[] = [];
  isLoading = false;

  constructor(private usersRolesService: UsersRolesService) {}

  ngOnInit() {
    if (this.siteId) {
      this.loadSiteUsers();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['siteId'] && !changes['siteId'].firstChange && this.siteId) {
      this.loadSiteUsers();
    }
  }


  loadSiteUsers() {
    if (!this.siteId) {
      this.users = [];
      return;
    }

    this.isLoading = true;

    this.usersRolesService.getSiteUsers(this.siteId).subscribe({
      next: (response: any) => {
        console.log('Site users response:', response);
        // Handle both direct array response and wrapped response
        const usersData = Array.isArray(response) ? response : (response?.data ?? response ?? []);
        this.users = usersData.map((dto: UserDto) => this.mapDtoToRow(dto));
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to load site users', error);
        this.users = [];
        this.isLoading = false;
      }
    });
  }

  private mapDtoToRow(dto: UserDto): SiteUserRow {
    return {
      id: dto.id ?? 0,
      username: dto.username || dto.userName || dto.name || dto.fullName || '—',
      phoneNumber: dto.phoneNumber || dto.phone || dto.mobile || '—',
      role: dto.role || dto.roleName || dto.userRole || '—',
      email: dto.email || dto.emailAddress || '—',
      status: this.getStatusLabel(dto.status, dto.isActive)
    };
  }

  private getStatusLabel(status: string | number | undefined, isActive: boolean | number | undefined): string {
    if (status !== undefined && status !== null) {
      if (typeof status === 'string') {
        return status;
      }
      // If numeric, convert to string
      return status === 1 ? 'Active' : 'Inactive';
    }
    if (isActive !== undefined && isActive !== null) {
      return isActive === true || isActive === 1 ? 'Active' : 'Inactive';
    }
    return '—';
  }

  getStatusClass(status: string): string {
    if (!status || status === '—') return '';
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return 'active';
    if (statusLower === 'inactive') return 'inactive';
    return '';
  }

  resetPassword(user: SiteUserRow) {
    // TODO: Implement reset password functionality
    console.log('Reset password for user:', user);
    alert(`Reset password functionality for ${user.username} will be implemented.`);
  }

  deactivateAccount(user: SiteUserRow) {
    const action = user.status === 'Active' ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} the account for ${user.username}?`)) {
      // TODO: Implement activate/deactivate functionality
      console.log(`${action} account for user:`, user);
      alert(`${action} account functionality for ${user.username} will be implemented.`);
    }
  }
}









