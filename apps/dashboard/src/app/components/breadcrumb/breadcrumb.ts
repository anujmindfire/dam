import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

interface BreadcrumbPart {
  name: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.html',
})
export class BreadcrumbComponent implements OnInit {
  parts: BreadcrumbPart[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateBreadcrumbs();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => this.updateBreadcrumbs());
  }

  private updateBreadcrumbs() {
    const urlParts = this.router.url.split('/').filter(p => p);
    this.parts = urlParts.map((part, index) => {
      const url = '/' + urlParts.slice(0, index + 1).join('/');
      const name = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      return { name, url };
    });
  }
}
