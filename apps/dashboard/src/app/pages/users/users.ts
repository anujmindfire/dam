import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { BadgeComponent } from '../../components/ui/badge/badge';
import { AppListComponent, Column } from '../../components/ui/list/list';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, ButtonComponent, BadgeComponent, AppListComponent],
  templateUrl: './users.html',
})
export class UsersComponent {
  columns: Column[] = [
    { id: 'name', label: 'Operator Identity', width: 40 },
    { id: 'role', label: 'Access Level' },
    { id: 'status', label: 'System Status' },
    { id: 'lastLogin', label: 'Last Interaction' },
    { id: 'actions', label: '', align: 'right' },
  ];

  users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', lastLogin: '2026-05-14 09:00 AM' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Operator', lastLogin: '2026-05-13 04:30 PM' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer', lastLogin: '2026-05-12 11:15 AM' },
  ];
}
