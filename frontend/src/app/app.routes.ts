import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RequestsComponent } from './components/requests/requests.component';
import { RequestDetailsComponent } from './components/request-details/request-details.component';
import { TeamComponent } from './components/team/team.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { LoginComponent } from './components/login/login.component';
import { CompaniesComponent } from './components/settings/companies/companies.component';
import { SitesComponent } from './components/settings/sites/sites.component';
import { SiteDetailsPageComponent } from './components/settings/sites/site-details-page/site-details-page.component';
import { GatesComponent } from './components/settings/gates/gates.component';
import { PricingComponent } from './components/settings/pricing/pricing.component';
import { UsersRolesComponent } from './components/settings/users-roles/users-roles.component';
import { CardsComponent } from './components/settings/cards/cards.component';
import { ServicesComponent } from './components/settings/services/services.component';
import { ValidatorListComponent } from './components/settings/validator-list/validator-list.component';
import { ReportsComponent } from './components/reports/reports.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'requests', component: RequestsComponent },
  { path: 'requests/:id', component: RequestDetailsComponent },
  { path: 'team', component: TeamComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'settings', redirectTo: '/settings/companies', pathMatch: 'full' },
  { path: 'settings/companies', component: CompaniesComponent },
  { path: 'settings/sites', component: SitesComponent },
  { path: 'settings/sites/:id', component: SiteDetailsPageComponent },
  { path: 'settings/gates', component: GatesComponent },
  { path: 'settings/pricing', component: PricingComponent },
  { path: 'settings/users-roles', component: UsersRolesComponent },
  { path: 'settings/cards', component: CardsComponent },
  { path: 'settings/services', component: ServicesComponent },
  { path: 'settings/validator-list', component: ValidatorListComponent },
  { path: 'login', component: LoginComponent },
];