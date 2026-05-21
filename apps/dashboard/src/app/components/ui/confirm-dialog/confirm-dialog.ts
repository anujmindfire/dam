import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Branded, accessible confirmation dialog.
 * Replaces browser's window.confirm() with a styled modal.
 *
 * Usage:
 * <app-confirm-dialog
 *   [isOpen]="showConfirm"
 *   [title]="'Delete Asset'"
 *   [message]="'Are you sure you want to delete this asset? This cannot be undone.'"
 *   confirmLabel="Delete"
 *   confirmVariant="danger"
 *   (confirmed)="onConfirm()"
 *   (cancelled)="showConfirm = false"
 * />
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-[3000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="dialogTitleId"
      [attr.aria-describedby]="dialogDescId"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        (click)="onCancel()"
        aria-hidden="true"
      ></div>

      <!-- Panel -->
      <div
        #dialogPanel
        class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4 animate-[slideUp_0.2s_ease-out]"
        tabindex="-1"
      >
        <!-- Icon + Title -->
        <div class="flex items-start gap-4">
          <div
            [ngClass]="{
              'bg-red-50 text-red-500': confirmVariant === 'danger',
              'bg-amber-50 text-amber-500': confirmVariant === 'warning',
              'bg-indigo-50 text-indigo-500': confirmVariant === 'default'
            }"
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <!-- Danger icon -->
            <svg *ngIf="confirmVariant === 'danger'"
              xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              aria-hidden="true">
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            <!-- Warning icon -->
            <svg *ngIf="confirmVariant === 'warning'"
              xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              aria-hidden="true">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>
            </svg>
            <!-- Info icon -->
            <svg *ngIf="confirmVariant === 'default'"
              xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/>
              <line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
          </div>

          <div>
            <h2 [id]="dialogTitleId" class="text-base font-bold text-slate-800">{{ title }}</h2>
            <p [id]="dialogDescId" class="mt-1 text-sm text-slate-500">{{ message }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            #cancelBtn
            type="button"
            class="flex-1 h-10 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
            (click)="onCancel()"
          >
            {{ cancelLabel }}
          </button>
          <button
            #confirmBtn
            type="button"
            [ngClass]="{
              'bg-red-500 hover:bg-red-600 focus:ring-red-300 text-white': confirmVariant === 'danger',
              'bg-amber-500 hover:bg-amber-600 focus:ring-amber-300 text-white': confirmVariant === 'warning',
              'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300 text-white': confirmVariant === 'default'
            }"
            class="flex-1 h-10 px-4 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus:ring-2"
            (click)="onConfirm()"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent implements AfterViewInit {
  @Input() isOpen = false;
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() confirmVariant: 'danger' | 'warning' | 'default' = 'danger';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('dialogPanel') dialogPanel!: ElementRef<HTMLElement>;
  @ViewChild('confirmBtn') confirmBtn!: ElementRef<HTMLButtonElement>;

  readonly dialogTitleId = `confirm-title-${Math.random().toString(36).slice(2)}`;
  readonly dialogDescId = `confirm-desc-${Math.random().toString(36).slice(2)}`;

  ngAfterViewInit() {
    // Auto-focus the confirm button when dialog opens
    if (this.isOpen) {
      setTimeout(() => this.confirmBtn?.nativeElement?.focus(), 50);
    }
  }

  @HostListener('keydown.escape')
  onEscape() {
    this.onCancel();
  }

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
