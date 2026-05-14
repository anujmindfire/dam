import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BRAND, NAV_ITEMS } from '../constants';

export interface NavItem {
  name: string;
  icon: string;
  path: string;
}

export interface BrandConfig {
  logo: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  getBrandConfig(): Observable<BrandConfig> {
    return of(BRAND);
  }

  getNavItems(): Observable<NavItem[]> {
    return of(NAV_ITEMS);
  }
}
