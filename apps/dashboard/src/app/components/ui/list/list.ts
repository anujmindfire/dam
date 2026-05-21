import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button';

export interface Column {
  id: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="w-full text-[var(--text-color)] animate-[fadeIn_0.5s_ease-out]">
      <!-- Search & Action Bar -->
      <div class="flex items-center justify-between p-3 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] border border-[var(--border)]">
        <div class="relative w-full max-w-2xl group">
          <input
            type="text"
            placeholder="Search..."
            [(ngModel)]="search"
            (ngModelChange)="onSearchChange($event)"
            class="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[var(--primary)] focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
          />
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--primary)] w-4 h-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>
        <div class="ml-4 flex-shrink-0">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>

      <!-- Table Container -->
      <div class="mt-6 rounded-2xl bg-white overflow-hidden border border-[var(--border)] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead class="bg-slate-50/50 border-b border-[var(--border)]">
              <tr>
                <th
                  *ngFor="let col of columns"
                  class="px-6 py-4 font-bold text-[11px] text-slate-500 uppercase tracking-widest"
                  [style.width]="col.width ? col.width + '%' : 'auto'"
                  [style.textAlign]="col.align || 'left'"
                >
                  <div
                    class="flex items-center gap-2"
                    [class.justify-center]="col.align === 'center'"
                    [class.justify-end]="col.align === 'right'"
                  >
                    {{ col.label }}
                    <svg *ngIf="col.sortable" class="w-3.5 h-3.5 opacity-30" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngIf="loading">
                <td [attr.colspan]="columns.length" class="py-20 text-center">
                  <div class="flex flex-col items-center justify-center gap-3">
                    <div class="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching Data</p>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!loading && rows.length === 0">
                <td [attr.colspan]="columns.length" class="py-20 text-center">
                  <div class="flex flex-col items-center justify-center gap-2 opacity-40">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <p class="text-sm font-bold uppercase tracking-widest">No matching records</p>
                  </div>
                </td>
              </tr>
              <tr *ngFor="let row of rows" class="hover:bg-slate-50/50 transition-colors group">
                <td
                  *ngFor="let col of columns"
                  class="px-6 py-4.5 text-sm"
                  [style.textAlign]="col.align || 'left'"
                >
                  <ng-container *ngTemplateOutlet="rowTemplate; context: { $implicit: row, columnId: col.id }"></ng-container>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="count > 0" class="flex flex-wrap justify-end items-center mt-8 gap-6">
        <div class="flex items-center gap-3">
          <label class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Show Rows:</label>
          <select
            class="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-bold outline-none cursor-pointer hover:border-[var(--primary)] transition-colors"
            [(ngModel)]="limit"
            (ngModelChange)="onLimitChange.emit($event)"
          >
            <option *ngFor="let size of [10, 25, 50, 100]" [value]="size">{{ size }}</option>
          </select>
        </div>
        <span class="text-xs text-slate-500 font-bold tracking-tight">
          {{ (page - 1) * limit + 1 }}-{{ min(page * limit, count) }}
          <span class="mx-1 text-slate-300">of</span> {{ count }}
        </span>
        <div class="flex gap-2">
          <app-button
            variant="outline"
            size="icon"
            [disabled]="page === 1"
            (onClick)="setPage(page - 1)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </app-button>
          <app-button
            variant="outline"
            size="icon"
            [disabled]="page >= totalPages"
            (onClick)="setPage(page + 1)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class AppListComponent {
  @Input() columns: Column[] = [];
  @Input() rows: any[] = [];
  @Input() count = 0;
  @Input() page = 1;
  @Input() limit = 10;
  @Input() loading = false;

  @Output() onSearch = new EventEmitter<string>();
  @Output() onPageChange = new EventEmitter<number>();
  @Output() onLimitChange = new EventEmitter<number>();

  @ContentChild('rowTemplate') rowTemplate!: TemplateRef<any>;

  search = '';
  private searchTimeout: any;

  get totalPages(): number {
    return Math.ceil(this.count / this.limit);
  }

  onSearchChange(val: string) {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.onSearch.emit(val);
    }, 500);
  }

  setPage(p: number) {
    this.onPageChange.emit(p);
  }

  min(a: number, b: number) {
    return Math.min(a, b);
  }
}
