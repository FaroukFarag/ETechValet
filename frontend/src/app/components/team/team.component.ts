import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRolesService, UserDto } from '../../services/users-roles.service';
import { AddMemberComponent } from './add-member/add-member.component';

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  siteName: string;
  phone: string;
  status: 'Active' | 'On Break' | 'Off Day' | 'Online';
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, AddMemberComponent],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  allTeamMembers: TeamMember[] = [];
  teamMembers: TeamMember[] = []; // Displayed members for current page
  openActionsMember: string | null = null;
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;
  isLoading = false;
  showAddMemberPanel = false;

  constructor(private usersService: UsersRolesService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    console.log('Loading team members from API...');
    
    this.usersService.getTeamMembers().subscribe({
      next: (response) => {
        console.log('Team members response:', response);
        const teamMembersData = response?.data ?? [];
        this.allTeamMembers = this.mapUsersToTeamMembers(teamMembersData);
        // Calculate total pages based on data length
        this.totalPages = Math.max(1, Math.ceil(this.allTeamMembers.length / this.pageSize));
        // Update displayed members for current page
        this.updateDisplayedMembers();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading team members:', error);
        this.allTeamMembers = [];
        this.teamMembers = [];
        this.totalPages = 1;
        this.isLoading = false;
      }
    });
  }

  updateDisplayedMembers() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.teamMembers = this.allTeamMembers.slice(startIndex, endIndex);
  }

  mapUsersToTeamMembers(users: UserDto[]): TeamMember[] {
    return users.map(user => {
      // Get initials from name or username
      const name = user.name || user.fullName || user.userName || user.username || 'Unknown';
      const initials = this.getInitials(name);
      
      // Get phone number from various possible fields
      const phone = user.phoneNumber || user.phone || user.mobile || 'N/A';
      
      // Map status - you may need to adjust this based on your API response
      const status = this.mapUserStatus(user.status, user.isActive);
      
      // Get site name - adjust based on your API structure
      const siteName = (user as any).siteName || 'N/A';

      return {
        id: user.id?.toString() || '',
        name: name,
        initials: initials,
        siteName: siteName,
        phone: phone,
        status: status
      };
    });
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  mapUserStatus(status: string | number | undefined, isActive?: boolean | number): TeamMember['status'] {
    // Map API status to TeamMember status
    // Adjust this logic based on your actual API response
    if (typeof status === 'string') {
      const statusLower = status.toLowerCase();
      if (statusLower.includes('active') || statusLower.includes('online')) {
        return 'Active';
      }
      if (statusLower.includes('break')) {
        return 'On Break';
      }
      if (statusLower.includes('off') || statusLower.includes('day')) {
        return 'Off Day';
      }
    }
    
    // Default based on isActive flag
    if (isActive === false || isActive === 0) {
      return 'Off Day';
    }
    
    // Default to Active if no status provided
    return 'Active';
  }

  getStatusClass(status: TeamMember['status']): string {
    return status.toLowerCase().replace(' ', '-');
  }

  toggleActions(memberId: string, event: MouseEvent) {
    event.stopPropagation();
    this.openActionsMember = this.openActionsMember === memberId ? null : memberId;
  }

  editMember(member: TeamMember, event?: MouseEvent) {
    event?.stopPropagation();
    console.log('Edit member:', member.id);
    this.openActionsMember = null;
  }

  deleteMember(member: TeamMember, event?: MouseEvent) {
    event?.stopPropagation();
    console.log('Delete member:', member.id);
    this.openActionsMember = null;
  }

  addMember() {
    this.showAddMemberPanel = true;
  }

  closeAddMemberPanel() {
    this.showAddMemberPanel = false;
    // Reload users to show the newly added member
    this.loadUsers();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedMembers();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedMembers();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updateDisplayedMembers();
    }
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];

    if (this.totalPages <= 7) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (this.currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(this.totalPages - 1, this.currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (this.currentPage < this.totalPages - 2) {
      pages.push('...');
    }

    pages.push(this.totalPages);
    return pages;
  }

  handlePageClick(page: number | string) {
    if (typeof page === 'number') {
      this.goToPage(page);
    }
  }

  @HostListener('document:click')
  closeActionsMenu() {
    this.openActionsMember = null;
  }
}