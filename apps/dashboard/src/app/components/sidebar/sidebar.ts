import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ConfigService, NavItem, BrandConfig } from '../../services/config.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit {
  navItems: NavItem[] = [];
  brandConfig: BrandConfig = { logo: '', name: '' };

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    this.configService.getNavItems().subscribe((items) => {
      this.navItems = items;
    });

    this.configService.getBrandConfig().subscribe((config) => {
      this.brandConfig = config;
    });
  }
}
