import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideArrowUpDown,
  LucideChevronLeft,
  LucideChevronRight,
  LucidePencil,
  LucidePlus,
  LucideSearch,
  LucideTrash2,
} from '@lucide/angular';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { ConfirmService } from '../../core/services/confirm.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HasPermissionDirective,
    LucideSearch,
    LucidePlus,
    LucideChevronLeft,
    LucideChevronRight,
    LucideArrowUpDown,
    LucideTrash2,
    LucidePencil,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  protected readonly service = inject(UserService);

  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // --- Icons ---
  protected readonly LucideSearch = LucideSearch;
  protected readonly LucidePlus = LucidePlus;
  protected readonly LucideChevronLeft = LucideChevronLeft;
  protected readonly LucideChevronRight = LucideChevronRight;
  protected readonly LucideArrowUpDown = LucideArrowUpDown;
  protected readonly LucideTrash2 = LucideTrash2;
  protected readonly LucidePencil = LucidePencil;

  // --- Computed for Pagination UI ---
  startRange = computed(() => (this.service.page() - 1) * this.service.limit() + 1);
  endRange = computed(() => {
    const end = this.service.page() * this.service.limit();
    return end > this.service.total() ? this.service.total() : end;
  });

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.service
      .fetchAll(
        this.service.page(),
        false,
        this.service.searchQuery(),
        this.service.limit(),
        this.service.sort(),
      )
      .subscribe();
  }

  async openForm(user: any = null) {
    if (user) {
      this.router.navigate([user.id], { relativeTo: this.route });
    } else {
      this.router.navigate(['new'], { relativeTo: this.route });
    }
  }

  onSearch(query: string) {
    this.service.fetchAll(1, false, query).subscribe();
  }

  onLimitChange(limit: number) {
    this.service.updateLimit(limit);
    this.fetchData();
  }

  onPageChange(page: number) {
    this.service.fetchAll(page).subscribe();
  }

  toggleSort(field: string) {
    const currentSort = this.service.sort();
    const [currField, currDir] = currentSort.split(':');
    let newDir = 'asc';
    if (currField === field && currDir === 'asc') {
      newDir = 'desc';
    }
    this.service
      .fetchAll(1, false, this.service.searchQuery(), this.service.limit(), `${field}:${newDir}`)
      .subscribe();
  }

  async onDelete(id: string) {
    const ok = await this.confirm.open({
      title: 'Hapus User',
      message: 'Apakah Anda yakin ingin menghapus user ini?',
      confirmText: 'Hapus',
      cancelText: 'Batal',
    });

    if (ok) {
      this.toast.success('Berhasil dihapus');
      this.service.remove(id).subscribe({
        next: () => this.fetchData(),
      });
    } else {
      this.toast.error('Gagal dihapus');
    }
  }
}
