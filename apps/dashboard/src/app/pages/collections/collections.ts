import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../components/ui/button/button';
import { BadgeComponent } from '../../components/ui/badge/badge';
import { AppListComponent, Column } from '../../components/ui/list/list';
import { CollectionService } from '../../services/collection.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonComponent, BadgeComponent, AppListComponent],
  templateUrl: './collections.html',
})
export class CollectionsComponent implements OnInit {
  columns: Column[] = [
    { id: 'name', label: 'Name', width: 45 },
    { id: 'assetCount', label: 'Assets Count', width: 20, align: 'center' },
    { id: 'createdAt', label: 'Created At', width: 20 },
    { id: 'actions', label: 'Actions', width: 15, align: 'right' },
  ];

  collections: any[] = [];
  allCollections: any[] = [];
  assets: any[] = [];
  parentOptions: any[] = [];
  currentCollection: any = null;

  currentParentId: string | null = null;
  totalCount = 0;
  assetCount = 0;
  isLoading = true;
  isModalOpen = false;
  newName = '';
  selectedParentId = '';

  page = 1;
  limit = 10;
  search = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private collectionService: CollectionService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.currentParentId = params.get('id');
      this.loadAll();
    });
  }

  loadAll() {
    this.loadCollections();
    this.loadParentOptions();
    if (this.currentParentId) {
      this.loadCurrentCollection();
    } else {
      this.currentCollection = null;
      this.assets = [];
      this.assetCount = 0;
    }
  }

  loadCollections() {
    this.isLoading = true;
    this.collectionService.getCollections({
      page: this.page,
      limit: this.limit,
      search: this.search,
      parentId: this.currentParentId
    }).subscribe({
      next: (res: any) => {
        const payload = res.data?.data || res.data || {};
        const rawList = Array.isArray(payload) ? payload : (payload.result || []);
        this.allCollections = rawList.map((col: any) => ({
          id: col.id,
          name: col.name,
          assetCount: col.assets?.length || 0,
          createdAt: new Date(col.createdAt).toLocaleDateString()
        }));
        this.filterCollections('');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load collections', err);
        this.toast.show('Failed to load collections from server', 'error');
        this.isLoading = false;
      }
    });
  }

  loadCurrentCollection() {
    if (!this.currentParentId) return;
    this.collectionService.getCollection(this.currentParentId).subscribe({
      next: (res: any) => {
        this.currentCollection = res.data;
        if (this.currentCollection?.assets) {
          this.assets = this.currentCollection.assets;
          this.assetCount = this.assets.length;
        }
      },
      error: (err) => {
        console.error('Failed to load current collection', err);
      }
    });
  }

  loadParentOptions() {
    this.collectionService.getCollections({ limit: 100 }).subscribe({
      next: (res: any) => {
        const payload = res.data?.data || res.data || {};
        const rawList = Array.isArray(payload) ? payload : (payload.result || []);
        this.parentOptions = rawList;
      },
      error: (err) => {
        console.error('Failed to load parent options', err);
      }
    });
  }

  filterCollections(term: string) {
    if (!term) {
      this.collections = [...this.allCollections];
    } else {
      const s = term.toLowerCase();
      this.collections = this.allCollections.filter(col => 
        (col.name || '').toLowerCase().includes(s)
      );
    }
    this.totalCount = this.collections.length;
  }

  handleSearch(term: string) {
    this.search = term;
    this.loadCollections();
  }

  handlePageChange(p: number) {
    this.page = p;
    this.loadCollections();
  }

  handleLimitChange(l: number) {
    this.limit = l;
    this.page = 1;
    this.loadCollections();
  }

  navigateDetail(id: string) {
    this.router.navigate(['/collections', id]);
  }

  viewAssetDetail(assetId: string) {
    this.router.navigate(['/assets', assetId]);
  }

  handleCreate() {
    if (!this.newName.trim()) {
      this.toast.show('Name is required', 'error');
      return;
    }
    let pId: string | number | null = this.selectedParentId || this.currentParentId || null;

    this.collectionService.createCollection(this.newName.trim(), pId).subscribe({
      next: () => {
        this.toast.show('Collection created successfully', 'success');
        this.newName = '';
        this.selectedParentId = '';
        this.isModalOpen = false;
        this.loadAll();
      },
      error: (err) => {
        console.error('Failed to create collection', err);
        this.toast.show('Failed to create collection', 'error');
      }
    });
  }

  handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    this.collectionService.deleteCollection(id).subscribe({
      next: () => {
        this.toast.show('Collection deleted successfully', 'success');
        this.loadAll();
      },
      error: (err) => {
        console.error('Failed to delete collection', err);
        this.toast.show('Failed to delete collection', 'error');
      }
    });
  }
}
