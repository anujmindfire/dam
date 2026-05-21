import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/**
 * Application routes — all page routes are LAZY LOADED to reduce initial bundle size.
 * Only the login/signup pages and the layout shell are included in the main chunk.
 *
 * Route title is automatically set in the browser tab via Angular's Title strategy.
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent),
    title: 'Sign In — DAM',
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup').then(m => m.SignupComponent),
    title: 'Create Account — DAM',
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
        title: 'Dashboard — DAM',
      },
      {
        path: 'assets',
        loadComponent: () => import('./pages/assets/assets').then(m => m.AssetsComponent),
        title: 'Asset Library — DAM',
      },
      {
        path: 'assets/:id',
        loadComponent: () => import('./pages/asset-detail/asset-detail').then(m => m.AssetDetailComponent),
        title: 'Asset Details — DAM',
      },
      {
        path: 'intelligence',
        loadComponent: () => import('./pages/intelligence/intelligence').then(m => m.IntelligenceComponent),
        title: 'Intelligence — DAM',
      },
      {
        path: 'compliance',
        loadComponent: () => import('./pages/compliance/compliance').then(m => m.ComplianceComponent),
        title: 'Compliance — DAM',
      },
      {
        path: 'jobs',
        loadComponent: () => import('./pages/jobs/jobs').then(m => m.JobsComponent),
        title: 'Background Jobs — DAM',
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings').then(m => m.SettingsComponent),
        title: 'Settings — DAM',
      },
      {
        path: 'approvals',
        loadComponent: () => import('./pages/approvals/approvals').then(m => m.ApprovalsComponent),
        title: 'Approvals — DAM',
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users').then(m => m.UsersComponent),
        title: 'Users — DAM',
      },
      {
        path: 'collections',
        loadComponent: () => import('./pages/collections/collections').then(m => m.CollectionsComponent),
        title: 'Collections — DAM',
      },
      {
        path: 'collections/:id',
        loadComponent: () => import('./pages/collections/collections').then(m => m.CollectionsComponent),
        title: 'Collection — DAM',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
