import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../components/ui/button/button';
import { BadgeComponent } from '../../components/ui/badge/badge';
import { AppListComponent, Column } from '../../components/ui/list/list';
import { ToastService } from '../../services/toast.service';
import { ApprovalService } from '../../services/approval.service';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, BadgeComponent, AppListComponent],
  templateUrl: './approvals.html',
})
export class ApprovalsComponent implements OnInit {
  columns: Column[] = [
    { id: 'assetsId', label: 'Asset Details', width: 35 },
    { id: 'requesterName', label: 'Requested by', width: 20 },
    { id: 'status', label: 'Status', width: 15, align: 'center' },
    { id: 'id', label: 'Request ID', width: 15, align: 'center' },
    { id: 'actions', label: 'Actions', width: 15, align: 'right' },
  ];

  requests: any[] = [];
  allRequests: any[] = [];
  totalCount = 0;
  page = 1;
  limit = 10;
  isLoading = false;
  isRejectModalOpen = false;
  rejectingId: string | number | null = null;
  rejectionReason = '';

  constructor(
    private router: Router,
    private toast: ToastService,
    private approvalService: ApprovalService
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this.approvalService.getApprovals('pending').subscribe({
      next: (res: any) => {
        const payload = res.data?.data || res.data || {};
        const rawList = Array.isArray(payload) ? payload : (payload.result || []);
        this.allRequests = rawList.map((req: any) => ({
          id: req.id,
          assetsId: req.assetsId,
          assets: req.assets,
          requesterName: req.requesterName || 'Internal System',
          status: req.status || 'pending',
          createdAt: req.createdAt
        }));
        this.filterRequests('');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load approvals', err);
        this.toast.show('Failed to fetch review inbox queue', 'error');
        this.isLoading = false;
      }
    });
  }

  filterRequests(term: string) {
    if (!term) {
      this.requests = [...this.allRequests];
    } else {
      const search = term.toLowerCase();
      this.requests = this.allRequests.filter(req => 
        (req.requesterName || '').toLowerCase().includes(search) ||
        (req.assets?.filename || '').toLowerCase().includes(search) ||
        String(req.assetsId).toLowerCase().includes(search)
      );
    }
    this.totalCount = this.requests.length;
  }

  handleSearch(term: string) {
    this.filterRequests(term);
  }

  handlePageChange(p: number) {
    this.page = p;
  }

  handleLimitChange(l: number) {
    this.limit = l;
    this.page = 1;
  }

  viewAsset(assetsId: string) {
    this.router.navigate(['/assets', assetsId]);
  }

  handleApprove(id: string | number) {
    this.approvalService.approve(id).subscribe({
      next: () => {
        this.toast.show('Review approved successfully', 'success');
        this.loadRequests();
      },
      error: () => this.toast.show('Failed to approve review', 'error')
    });
  }

  handleRejectClick(id: string | number) {
    this.rejectingId = id;
    this.rejectionReason = '';
    this.isRejectModalOpen = true;
  }

  confirmReject() {
    if (!this.rejectionReason.trim()) {
      this.toast.show('Please provide a reason for rejection', 'error');
      return;
    }
    if (!this.rejectingId) return;

    this.approvalService.reject(this.rejectingId, this.rejectionReason).subscribe({
      next: () => {
        this.toast.show('Review rejected successfully', 'success');
        this.isRejectModalOpen = false;
        this.rejectingId = null;
        this.loadRequests();
      },
      error: () => this.toast.show('Failed to reject review', 'error')
    });
  }
}
