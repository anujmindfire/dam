import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../card/card';
import { ButtonComponent } from '../button/button';
import { AssetService } from '../../../services/asset.service';
import { ToastService } from '../../../services/toast.service';
import { HttpEventType } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-upload-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, ButtonComponent],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div class="w-full max-w-lg animate-[slideUp_0.3s_ease-out]">
        <app-card class="shadow-2xl">
          <div class="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <h2 class="text-xl font-bold tracking-tight text-[var(--text-color)] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--primary)]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Upload Digital Assets
            </h2>
            <app-button variant="ghost" (onClick)="close()" class="w-8 h-8 p-0" [disabled]="isUploading">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </app-button>
          </div>

          <app-card-body class="space-y-6 pt-6">
            <div
              *ngIf="!selectedFile"
              (click)="fileInput.click()"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              [class.border-[var(--primary)]]="dragActive"
              [class.bg-indigo-50/50]="dragActive"
              class="h-[160px] rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
            >
              <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--primary)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </div>
              <div class="text-center">
                <p class="text-sm font-bold text-slate-700">
                  Drag & drop file here, or <span class="text-[var(--primary)]">browse</span>
                </p>
                <p class="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
                  Images, Videos, Audio, PDFs (Max 5GB)
                </p>
              </div>
              <input #fileInput type="file" class="hidden" (change)="onFileSelected($event)" />
            </div>

            <div *ngIf="selectedFile" class="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[var(--primary)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="text-sm font-bold text-slate-700 truncate max-w-[240px]">{{ selectedFile.name }}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</span>
                  </div>
                </div>
                <app-button *ngIf="!isUploading" variant="ghost" size="icon" (onClick)="removeFile()" class="text-slate-400 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </app-button>
              </div>

              <div *ngIf="isUploading" class="space-y-2">
                <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                  <span class="flex items-center gap-1">Ingesting to Vault...</span>
                  <span>{{ uploadProgress }}%</span>
                </div>
                <div class="w-full h-1.5 bg-white rounded-full overflow-hidden">
                  <div class="h-full bg-[var(--primary)] transition-all duration-300" [style.width.%]="uploadProgress"></div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Department <span class="text-red-500">*</span>
                </label>
                <select
                  [(ngModel)]="department"
                  class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[var(--primary)] focus:bg-white transition-all"
                  [disabled]="isUploading"
                >
                  <option>Marketing</option>
                  <option>Public Relations</option>
                  <option>Product Design</option>
                  <option>Engineering</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Usage Rights <span class="text-red-500">*</span>
                </label>
                <select
                  [(ngModel)]="usageRights"
                  class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[var(--primary)] focus:bg-white transition-all"
                  [disabled]="isUploading"
                >
                  <option value="">Select Rights</option>
                  <option value="Internal Use Only">Internal Use Only</option>
                  <option value="Public (Royalty Free)">Public (Royalty Free)</option>
                  <option value="Limited (Credit Required)">Limited (Credit Required)</option>
                  <option value="Restricted (License Required)">Restricted (License Required)</option>
                  <option value="Private / NDA">Private / NDA</option>
                </select>
              </div>
              <div class="space-y-2 col-span-2">
                <label class="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  [(ngModel)]="expiryDate"
                  class="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[var(--primary)] focus:bg-white transition-all"
                  [disabled]="isUploading"
                />
              </div>
            </div>
          </app-card-body>

          <div class="p-6 flex gap-3 border-t border-slate-100">
            <app-button variant="outline" class="flex-1" [fullWidth]="true" (onClick)="close()" [disabled]="isUploading">
              Cancel
            </app-button>
            <app-button
              class="flex-1 shadow-lg shadow-indigo-100"
              [fullWidth]="true"
              [disabled]="!selectedFile || !usageRights || isUploading"
              (onClick)="startUpload()"
            >
              {{ isUploading ? 'Uploading...' : 'Upload' }}
            </app-button>
          </div>
        </app-card>
      </div>
    </div>
  `,
})
export class UploadModalComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<void>();

  selectedFile: File | null = null;
  dragActive = false;
  isUploading = false;
  uploadProgress = 0;
  department = 'Marketing';
  usageRights = '';
  expiryDate = '';

  constructor(private assetService: AssetService, private toast: ToastService) {}

  close() {
    this.onClose.emit();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragActive = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragActive = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragActive = false;
    if (event.dataTransfer?.files?.[0]) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  removeFile() {
    this.selectedFile = null;
  }

  async startUpload() {
    if (!this.selectedFile) return;
    this.isUploading = true;
    this.uploadProgress = 0;
    
    try {
      // 1. Get Presigned URL
      const urlRes: any = await lastValueFrom(this.assetService.getUploadUrl({
        filename: this.selectedFile.name,
        mimetype: this.selectedFile.type
      }));
      
      const payload = urlRes?.data?.data || urlRes?.data || {};
      const { uploadUrl, storageKey } = payload;
      
      if (!uploadUrl) {
        throw new Error('Failed to retrieve secure upload URL');
      }

      // 2. Upload directly to MinIO
      this.assetService.uploadToMinio(uploadUrl, this.selectedFile, this.selectedFile.type)
        .subscribe({
          next: async (event: any) => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              this.uploadProgress = Math.round((event.loaded * 100) / event.total);
            } else if (event.type === HttpEventType.Response) {
              // 3. Finalize metadata binding
              try {
                await lastValueFrom(this.assetService.completeUpload({
                  department: this.department,
                  usageRights: this.usageRights,
                  expiryDate: this.expiryDate,
                  filename: this.selectedFile!.name,
                  storageKey,
                  size: this.selectedFile!.size,
                  mimetype: this.selectedFile!.type
                }));
                
                this.toast.show('Assets uploaded successfully', 'success');
                this.selectedFile = null;
                this.usageRights = '';
                this.expiryDate = '';
                this.uploadProgress = 0;
                this.isUploading = false;
                
                this.onSuccess.emit();
                this.close();
              } catch (err) {
                console.error('Completion error', err);
                this.toast.show('Failed to finalize asset metadata', 'error');
                this.isUploading = false;
              }
            }
          },
          error: (err: any) => {
            console.error('MinIO upload error', err);
            this.toast.show('Upload failed. Please check your connection to MinIO.', 'error');
            this.isUploading = false;
          }
        });
        
    } catch (error) {
      console.error('Initialization error', error);
      this.toast.show('Failed to initiate secure upload', 'error');
      this.isUploading = false;
    }
  }
}
