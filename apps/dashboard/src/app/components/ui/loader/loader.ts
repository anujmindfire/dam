import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'flex items-center justify-center ' + className">
      <div class="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() className = '';
}

@Component({
  selector: 'app-page-loader',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-4">
        <app-loading-spinner></app-loading-spinner>
        <p class="text-sm font-bold text-[var(--text-color)] uppercase tracking-widest animate-pulse">
          Syncing...
        </p>
      </div>
    </div>
  `,
})
export class PageLoaderComponent {}

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `<div [class]="'bg-gray-200 animate-pulse rounded-lg ' + className"></div>`,
})
export class SkeletonComponent {
  @Input() className = '';
}

@Component({
  selector: 'app-page-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="flex flex-col gap-8 w-full">
      <div class="flex justify-between items-end">
        <div class="space-y-2">
          <app-skeleton className="h-10 w-64"></app-skeleton>
          <app-skeleton className="h-4 w-96"></app-skeleton>
        </div>
        <app-skeleton className="h-10 w-48"></app-skeleton>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-skeleton *ngFor="let i of [1,2,3,4]" className="h-32"></app-skeleton>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <app-skeleton className="lg:col-span-2 h-[400px]"></app-skeleton>
        <app-skeleton className="h-[400px]"></app-skeleton>
      </div>
    </div>
  `,
})
export class PageSkeletonComponent {}
