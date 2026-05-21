import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'loading' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastItem[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(message: string, type: ToastType = 'info') {
    const id = Math.random().toString(36).substring(2, 9);
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, { id, message, type }]);
    
    if (type !== 'loading') {
      setTimeout(() => this.remove(id), 5000);
    }
  }

  remove(id: string) {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter(t => t.id !== id));
  }
}
