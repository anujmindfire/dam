import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { BadgeComponent } from '../../components/ui/badge/badge';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, ButtonComponent, BadgeComponent],
  templateUrl: './collections.html',
})
export class CollectionsComponent {
  collections = [
    { id: '1', name: 'Summer 2026 Campaign', assetCount: 24 },
    { id: '2', name: 'Brand Identity', assetCount: 15 },
    { id: '3', name: 'Product Launches', assetCount: 42 },
    { id: '4', name: 'Social Media', assetCount: 120 },
    { id: '5', name: 'Internal Docs', assetCount: 8 },
  ];
}
