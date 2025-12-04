import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterOutlet, provideRouter, NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { SidebarComponent } from './app/components/sidebar/sidebar.component';
import { HeaderComponent } from './app/components/header/header.component';
import { routes } from './app/app.routes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <ng-container *ngIf="showLayout; else authLayout">
      <div class="app-layout" [class.sidebar-collapsed]="sidebarCollapsed">
        <app-sidebar [collapsed]="sidebarCollapsed"></app-sidebar>
        <div class="main-layout">
          <app-header [sidebarCollapsed]="sidebarCollapsed" (toggleSidebar)="toggleSidebar()"></app-header>
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </ng-container>
    <ng-template #authLayout>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      transition: all 0.3s ease;
    }
    
    .app-layout.sidebar-collapsed .main-layout {
      margin-left: 70px;
    }
    
    .main-layout {
      flex: 1;
      margin-left: 240px;
      display: flex;
      flex-direction: column;
      transition: margin-left 0.3s ease;
      min-width: 0;
    }
    
    .main-content {
      margin-top: 70px;
      flex: 1;
      overflow-x: hidden;
    }
    
    @media (max-width: 768px) {
      .main-layout {
        margin-left: 0;
      }
      
      .app-layout.sidebar-collapsed .main-layout {
        margin-left: 0;
      }
    }
  `]
})
export class App {
  sidebarCollapsed = false;
  showLayout = true;

  constructor(private router: Router) {
    this.updateLayout(this.router.url);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateLayout(event.urlAfterRedirects);
      }
    });
  }
  
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  private updateLayout(url: string) {
    this.showLayout = !url.startsWith('/login');
  }
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
});