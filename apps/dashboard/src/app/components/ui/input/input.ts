import { Component, Input, forwardRef, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full space-y-2 group">
      <label *ngIf="label" class="block text-xs font-semibold text-slate-700 ml-1">
        {{ label }}
      </label>
      <div class="relative transition-all duration-300">
        <input
          [type]="type"
          [placeholder]="placeholder"
          [(ngModel)]="value"
          (ngModelChange)="onChange($event)"
          (blur)="onTouched()"
          [class]="'w-full px-4 border border-slate-200 rounded-xl outline-none bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 placeholder:text-slate-400 text-slate-900 ' + (icon ? 'pl-11 ' : '') + (error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10 ' : '') + className"
          [style.height]="'var(--input-height)'"
        />
        <div *ngIf="icon" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
          <ng-content select="[icon]"></ng-content>
        </div>
      </div>
      <!-- Error Message with Animation -->
      <div 
        *ngIf="error" 
        class="text-rose-500 text-[11px] font-semibold ml-1 flex items-center gap-1 animate-[slideInDown_0.2s_ease-out]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    @keyframes slideInDown {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() icon = false;
  @Input() className = '';

  value = '';
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
