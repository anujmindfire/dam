import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../card/card';
import { ButtonComponent } from '../button/button';
import { CollectionService } from '../../../services/collection.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-add-to-collection-modal',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, ButtonComponent],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <app-card class="w-full max-w-md shadow-2xl overflow-hidden border-white/5 animate-[slideUp_0.3s_ease-out]">
        <app-card-header [className]="'flex flex-row items-center justify-between !pb-6 !bg-transparent w-full'">
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
          <div *ngIf="isLoading" class="p-16 flex justify-center text-indigo-500">
            <svg class="animate-spin w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
          <ng-container *ngIf="!isLoading && collections.length > 0">
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
          <div *ngIf="!isLoading && collections.length === 0" class="p-16 text-center text-slate-400 text-sm font-medium italic">
            No collection hubs found.
          </div>
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
export class AddToCollectionModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() assetsId = '';
  @Output() onClose = new EventEmitter<void>();

  collections: any[] = [];
  isLoading = false;

  constructor(private collectionService: CollectionService, private toast: ToastService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen) {
      this.loadCollections();
    }
  }

  loadCollections() {
    this.isLoading = true;
    this.collectionService.getCollections({ limit: 100 }).subscribe({
      next: (res: any) => {
        const payload = res.data?.data || res.data || {};
        this.collections = Array.isArray(payload) ? payload : (payload.result || []);
        this.isLoading = false;
      },
      error: () => {
        this.toast.show('Failed to retrieve collections', 'error');
        this.isLoading = false;
      }
    });
  }

  close() {
    this.onClose.emit();
  }

  select(id: string) {
    if (!this.assetsId) return;
    this.collectionService.addAssetToCollection(id, this.assetsId).subscribe({
      next: () => {
        this.toast.show('Assets added to collection successfully', 'success');
        this.close();
      },
      error: () => {
        this.toast.show('Failed to bind asset to collection', 'error');
      }
    });
  }
}
