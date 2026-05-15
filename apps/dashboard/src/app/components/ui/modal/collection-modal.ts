import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../card/card';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-add-to-collection-modal',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, ButtonComponent],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <app-card class="w-full max-w-md shadow-2xl overflow-hidden border-white/5 animate-[slideUp_0.3s_ease-out]">
        <app-card-header class="flex flex-row items-center justify-between border-b border-slate-100 pb-6">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-[var(--primary)] border border-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
            </div>
            <app-card-title>Organize Assets</app-card-title>
          </div>
          <app-button variant="ghost" size="icon" (onClick)="close()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </app-button>
        </app-card-header>
        
        <div class="flex flex-col max-h-[400px] overflow-y-auto bg-white">
          <ng-container *ngIf="collections.length > 0; else emptyState">
            <button
              *ngFor="let col of collections; let last = last"
              (click)="select(col.id)"
              [class.border-b]="!last"
              class="px-8 py-5 flex items-center justify-between group hover:bg-indigo-600 transition-all text-left border-slate-50"
            >
              <div class="flex flex-col gap-1">
                <span class="text-sm font-bold text-[var(--text-color)] group-hover:text-white transition-colors">{{ col.name }}</span>
                <span class="text-[10px] text-slate-400 group-hover:text-indigo-100 font-bold uppercase tracking-widest transition-colors">{{ col.assetCount || 0 }} Assets</span>
              </div>
              <svg class="text-[var(--primary)] opacity-0 group-hover:opacity-100 group-hover:text-white transition-all transform scale-50 group-hover:scale-100" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
          </ng-container>
          <ng-template #emptyState>
            <div class="p-16 text-center text-slate-400 text-sm font-medium italic">
              No collection hubs found.
            </div>
          </ng-template>
        </div>

        <div class="p-6 border-t border-slate-50 bg-slate-50/50 flex justify-end">
          <app-button variant="outline" size="sm" (onClick)="close()" class="px-6 font-bold uppercase text-[10px] tracking-widest">
            Dismiss
          </app-button>
        </div>
      </app-card>
    </div>
  `,
})
export class AddToCollectionModalComponent {
  @Input() isOpen = false;
  @Input() collections: any[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onSelect = new EventEmitter<string>();

  close() {
    this.onClose.emit();
  }

  select(id: string) {
    this.onSelect.emit(id);
  }
}
