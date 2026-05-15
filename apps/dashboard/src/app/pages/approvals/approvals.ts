import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { BadgeComponent } from '../../components/ui/badge/badge';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, ButtonComponent, BadgeComponent],
  templateUrl: './approvals.html',
})
export class ApprovalsComponent {
  approvals = [
    { id: '1', name: 'Product_Shoot_Final_01.jpg', user: 'Marketing Team', time: '2 hours ago' },
    { id: '2', name: 'Brand_Video_Draft.mp4', user: 'Creative Dept', time: '5 hours ago' },
  ];
}
