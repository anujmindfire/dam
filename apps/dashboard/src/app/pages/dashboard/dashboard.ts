import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, ButtonComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  error: string | null = null;
  
  stats = [
    { label: 'Total Assets', value: '0', trend: '---', trendUp: true, icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6 4 14H4L8 6Z"/><path d="M12 6V2"/><path d="M9 2h6"/></svg>', color: 'bg-indigo-500' },
    { label: 'Compliance Score', value: '0%', trend: '---', trendUp: true, icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>', color: 'bg-emerald-500' },
    { label: 'Duplicates', value: '0', trend: '---', trendUp: false, icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>', color: 'bg-amber-500' },
    { label: 'Expiring Soon', value: '0', trend: '---', trendUp: false, icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', color: 'bg-rose-500' },
  ];

  activity = [
    { title: 'Asset Ingested', time: '2m ago', user: 'System Agent', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>' },
    { title: 'Metadata Sync', time: '15m ago', user: 'AI Worker', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>' },
    { title: 'User Approved', time: '1h ago', user: 'Admin Hub', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>' },
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.fetchOverview();
  }

  fetchOverview() {
    this.isLoading = true;
    this.error = null;
    
    this.dashboardService.getOverview().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          
          this.stats = [
            { label: 'Total Assets', value: data.totalAssets.toLocaleString(), trend: 'Active', trendUp: true, icon: this.stats[0].icon, color: this.stats[0].color },
            { label: 'Compliance Score', value: `${data.complianceScore}%`, trend: 'Health', trendUp: true, icon: this.stats[1].icon, color: this.stats[1].color },
            { label: 'Duplicates', value: data.duplicateCount.toLocaleString(), trend: 'Review', trendUp: false, icon: this.stats[2].icon, color: this.stats[2].color },
            { label: 'Expiring Soon', value: data.atRiskCount.toLocaleString(), trend: 'Action', trendUp: false, icon: this.stats[3].icon, color: this.stats[3].color },
          ];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard stats', err);
        this.error = 'Failed to load dashboard data. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}

