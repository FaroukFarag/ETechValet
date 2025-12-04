import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesComponent } from './roles/roles.component';
import { UsersComponent } from './users/users.component';

type TabKey = 'Roles' | 'Users';

@Component({
  selector: 'app-settings-users-roles',
  standalone: true,
  imports: [CommonModule, RolesComponent, UsersComponent],
  templateUrl: './users-roles.component.html',
  styleUrls: ['./users-roles.component.scss']
})
export class UsersRolesComponent {
  readonly tabs: TabKey[] = ['Roles', 'Users'];
  activeTab: TabKey = 'Roles';
  
  triggerAddUser = 0;
  triggerExportRoles = 0;
  triggerExportUsers = 0;

  setActiveTab(tab: TabKey): void {
    if (this.activeTab === tab) {
      return;
    }
    this.activeTab = tab;
  }

  exportCurrentTab(): void {
    if (this.activeTab === 'Roles') {
      this.triggerExportRoles++;
    } else if (this.activeTab === 'Users') {
      this.triggerExportUsers++;
    }
  }

  addItem(): void {
    if (this.activeTab === 'Users') {
      this.triggerAddUser++;
    }
  }
}
