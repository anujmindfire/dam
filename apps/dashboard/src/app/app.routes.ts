import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { LayoutComponent } from './components/layout/layout';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AssetsComponent } from './pages/assets/assets';
import { IntelligenceComponent } from './pages/intelligence/intelligence';
import { ComplianceComponent } from './pages/compliance/compliance';
import { JobsComponent } from './pages/jobs/jobs';
import { SettingsComponent } from './pages/settings/settings';
import { SignupComponent } from './pages/signup/signup';
import { ApprovalsComponent } from './pages/approvals/approvals';
import { UsersComponent } from './pages/users/users';
import { CollectionsComponent } from './pages/collections/collections';
import { AssetDetailComponent } from './pages/asset-detail/asset-detail';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'assets', component: AssetsComponent },
      { path: 'assets/:id', component: AssetDetailComponent },
      { path: 'intelligence', component: IntelligenceComponent },
      { path: 'compliance', component: ComplianceComponent },
      { path: 'jobs', component: JobsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'approvals', component: ApprovalsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'collections', component: CollectionsComponent },
    ],
  },
];
