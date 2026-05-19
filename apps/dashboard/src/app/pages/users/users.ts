import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { BadgeComponent } from '../../components/ui/badge/badge';
import { AppListComponent, Column } from '../../components/ui/list/list';
import { UserService, UserProps } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, ButtonComponent, BadgeComponent, AppListComponent],
  templateUrl: './users.html',
})
export class UsersComponent implements OnInit {
  columns: Column[] = [
    { id: 'name', label: 'Name', width: 35, sortable: true },
    { id: 'email', label: 'Email', width: 35, sortable: true },
    { id: 'status', label: 'Status', width: 15, align: 'center' },
    { id: 'actions', label: 'Actions', width: 15, align: 'right' },
  ];

  users: UserProps[] = [];
  totalCount = 0;
  isLoading = true;
  searchTerm = '';
  currentPage = 1;
  limit = 10;

  isEditModalOpen = false;
  editingUser: UserProps | null = null;
  editName = '';

  constructor(
    private userService: UserService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading = true;
    this.userService.getUsers({
      page: this.currentPage,
      limit: this.limit,
      searchKey: this.searchTerm || undefined
    }).subscribe({
      next: (res: any) => {
        const payload = res.data?.data || res.data || {};
        const userData = Array.isArray(payload) ? payload : (payload.result || []);
        const count = res.totalCount || userData.length;
        this.users = userData;
        this.totalCount = count;
        this.isLoading = false;
      },
      error: (err: any) => {
        const msg = err.error?.message || err.message || 'Failed to load users';
        this.toast.show(msg, 'error');
        this.isLoading = false;
      }
    });
  }

  handleSearch(term: string) {
    this.searchTerm = term;
    this.currentPage = 1;
    this.fetchUsers();
  }

  handlePageChange(page: number) {
    this.currentPage = page;
    this.fetchUsers();
  }

  handleLimitChange(limit: number) {
    this.limit = limit;
    this.currentPage = 1;
    this.fetchUsers();
  }

  handleEditClick(user: UserProps) {
    this.editingUser = user;
    this.editName = user.name;
    this.isEditModalOpen = true;
  }

  handleUpdate() {
    if (!this.editingUser) return;
    this.userService.updateUser(this.editingUser.id, { name: this.editName }).subscribe({
      next: () => {
        this.toast.show('User identity updated', 'success');
        this.isEditModalOpen = false;
        this.fetchUsers();
      },
      error: (err: any) => {
        const msg = err.error?.message || err.message || 'Failed to update user';
        this.toast.show(msg, 'error');
      }
    });
  }

  handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.toast.show('User deleted successfully', 'success');
        this.fetchUsers();
      },
      error: (err: any) => {
        const msg = err.error?.message || err.message || 'Failed to delete user';
        this.toast.show(msg, 'error');
      }
    });
  }
}
