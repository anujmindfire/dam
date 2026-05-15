import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../../components/ui/card/card';
import { BadgeComponent } from '../../components/ui/badge/badge';
import { AppListComponent, Column } from '../../components/ui/list/list';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, BadgeComponent, AppListComponent],
  templateUrl: './jobs.html',
})
export class JobsComponent {
  columns: Column[] = [
    { id: 'id', label: 'Job ID' },
    { id: 'type', label: 'Process Type', width: 30 },
    { id: 'progress', label: 'Integrity' },
    { id: 'status', label: 'Status' },
    { id: 'startedAt', label: 'Execution Time' },
  ];

  jobs = [
    { id: '9842', type: 'AI Metadata Enrichment', progress: 85, status: 'processing', startedAt: '10:24 AM' },
    { id: '9841', type: 'Vector Embedding Sync', progress: 100, status: 'completed', startedAt: '10:15 AM' },
    { id: '9840', type: 'Video Transcoding', progress: 45, status: 'processing', startedAt: '10:02 AM' },
  ];
}
