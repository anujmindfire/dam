import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { BadgeComponent } from '../../components/ui/badge/badge';

@Component({
  selector: 'app-asset-detail',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, ButtonComponent, BadgeComponent],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.css',
})
export class AssetDetailComponent {
  activeTab = 'activity';

  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
}
