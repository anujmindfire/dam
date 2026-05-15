import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout.html',
})
export class LogoutComponent {
  isOpen = false;
  isLoading = false;
  user: AuthUser | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private eRef: ElementRef
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  get avatarInitial(): string {
    return this.user?.name?.charAt(0).toUpperCase() || 'A';
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  async handleLogout() {
    this.isLoading = true;
    try {
      this.authService.logout();
      this.router.navigate(['/login']);
    } finally {
      this.isLoading = false;
      this.isOpen = false;
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
