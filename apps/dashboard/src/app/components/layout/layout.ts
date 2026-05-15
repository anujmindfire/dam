import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { HeaderComponent } from '../header/header';
import { ToastContainerComponent } from '../ui/toast/toast';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, HeaderComponent, ToastContainerComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent implements OnInit {
  isOpen = window.innerWidth >= 1024;

  ngOnInit() {
    this.checkWidth();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkWidth();
  }

  private checkWidth() {
    if (window.innerWidth < 1024) {
      this.isOpen = false;
    } else {
      this.isOpen = true;
    }
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }
}
