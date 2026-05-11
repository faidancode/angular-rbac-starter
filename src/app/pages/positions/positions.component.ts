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
import { PositionService } from '../../core/services/position.service';
import { ModalService } from '../../shared/services/modal.service';
import { PositionFormComponent } from './position-form.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-position',
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
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss'],
})
export class PositionComponent implements OnInit {
  protected readonly service = inject(PositionService);

  private confirm = inject(ConfirmService);
  private modal = inject(ModalService);
  private toast = inject(ToastService);

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

  async openForm(position: any = null) {
    const result = await this.modal.open(PositionFormComponent, {
      position,
    });

    if (result) {
      this.fetchData();
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
      title: 'Hapus Position',
      message: 'Apakah Anda yakin ingin menghapus position ini?',
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
