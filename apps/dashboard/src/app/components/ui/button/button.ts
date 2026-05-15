import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || isLoading"
      (click)="onClick.emit($event)"
      [class]="'relative inline-flex items-center justify-center rounded-xl font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group ' + 
        getVariantClasses() + ' ' + getSizeClasses() + ' ' + className"
      [class.w-full]="fullWidth"
    >
      <!-- Loading Overlay -->
      <div *ngIf="isLoading" class="absolute inset-0 bg-inherit flex items-center justify-center z-10">
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <span [class.opacity-0]="isLoading" class="flex items-center gap-2">
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styles: [`
    :host {
      display: inline-block;
      vertical-align: middle;
    }
    :host.w-full {
      display: block;
      width: 100%;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' | 'icon' = 'md';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() fullWidth = false;
  @Input() isLoading = false;
  @Input() disabled = false;
  @Input() className = '';

  @HostBinding('class.w-full') get isFullWidth() {
    return this.fullWidth;
  }

  @Output() onClick = new EventEmitter<MouseEvent>();

  getVariantClasses() {
    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30',
      secondary: 'bg-slate-800 text-white hover:bg-slate-900 shadow-md',
      danger: 'bg-rose-500 text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/30',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30',
      outline: 'bg-transparent border-2 border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-indigo-600',
    };
    return variants[this.variant] || variants.primary;
  }

  getSizeClasses() {
    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3.5 text-sm',
      lg: 'px-8 py-4.5 text-base',
      icon: 'p-2.5',
    };
    return sizes[this.size] || sizes.md;
  }
}
