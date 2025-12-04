import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

interface MenuChild {
  label: string;
  route: string;
}

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  children?: MenuChild[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() collapsed = false;

  menuItems: MenuItem[] = [
    { icon: 'home', label: 'Home', route: '/home' },
    { icon: 'requests', label: 'Requests', route: '/requests' },
    { icon: 'team', label: 'Team', route: '/team' },
    { icon: 'notifications', label: 'Notifications', route: '/notifications' },
    { icon: 'reports', label: 'Reports', route: '/reports' },
    {
      icon: 'settings',
      label: 'Settings',
      children: [
        { label: 'Companies', route: '/settings/companies' },
        { label: 'Sites', route: '/settings/sites' },
        { label: 'Users & Roles', route: '/settings/users-roles' },
        { label: 'Cards', route: '/settings/cards' },
        { label: 'Services', route: '/settings/services' },
        { label: 'Validator List', route: '/settings/validator-list' },
      ]
    },
    { icon: 'logout', label: 'Logout', route: '/login' }
  ];

  expandedMenu: string | null = null;
  currentUrl = '';

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
    this.updateExpandedFromUrl();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects;
        this.updateExpandedFromUrl();
      });
  }

  toggleMenu(label: string): void {
    this.expandedMenu = this.expandedMenu === label ? null : label;
  }

  isItemActive(item: MenuItem): boolean {
    if (item.children) {
      return item.children.some(child => this.currentUrl.startsWith(child.route));
    }
    return item.route ? this.currentUrl.startsWith(item.route) : false;
  }

  private updateExpandedFromUrl(): void {
    const activeParent = this.menuItems.find(item =>
      item.children?.some(child => this.currentUrl.startsWith(child.route))
    );

    if (activeParent) {
      this.expandedMenu = activeParent.label;
    }
  }
}