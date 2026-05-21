import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border"
      [class]="badgeClasses"
    >
      <ng-content></ng-content>
    </span>
  `,
  styles: [`
    :host { display: inline-block; }
  `]
})
export class BadgeComponent {
  @Input() type: 'default' | 'success' | 'warning' | 'error' | 'info' = 'default';
  @Input() className = '';

  get badgeClasses() {
    const types = {
      default: 'bg-slate-50 text-slate-500 border-slate-200',
      success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      warning: 'bg-amber-50 text-amber-600 border-amber-100',
      error: 'bg-rose-50 text-rose-600 border-rose-100',
      info: 'bg-blue-50 text-blue-600 border-blue-100'
    };

    return `${types[this.type]} ${this.className}`;
  }
}
