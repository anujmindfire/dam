import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule],
  template: `<div [class]="'px-8 py-6 border-b border-slate-100 bg-slate-50/50 ' + className"><ng-content></ng-content></div>`,
})
export class CardHeaderComponent {
  @Input() className = '';
}

@Component({
  selector: 'app-card-title',
  standalone: true,
  imports: [CommonModule],
  template: `<h2 [class]="'text-xl font-bold tracking-tight text-[var(--text-color)] ' + className"><ng-content></ng-content></h2>`,
})
export class CardTitleComponent {
  @Input() className = '';
}

@Component({
  selector: 'app-card-body',
  standalone: true,
  imports: [CommonModule],
  template: `<div [class]="'p-8 ' + className"><ng-content></ng-content></div>`,
})
export class CardBodyComponent {
  @Input() className = '';
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      border-radius: 1.5rem;
      border: 1px solid var(--border);
      box-shadow: 0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background-color: white;
    }
  `]
})
export class CardComponent {
  @Input() className = '';
  @Input() customStyle: { [key: string]: string } = {};

  @HostBinding('style') get hostStyle() {
    return this.customStyle;
  }
}
