import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, ButtonComponent],
  templateUrl: './compliance.html',
})
export class ComplianceComponent {}
