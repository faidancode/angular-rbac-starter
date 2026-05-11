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
  LucideTrash2
} from '@lucide/angular';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { ConfirmService } from '../../core/services/confirm.service';
import { DepartmentService } from '../../core/services/department.service';
import { ModalService } from '../../shared/services/modal.service';
import { DepartmentFormComponent } from './department-form.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-department',
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
    LucidePencil
  ],
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit {
  protected readonly service = inject(DepartmentService);

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
    this.service.fetchAll(
      this.service.page(),
      false,
      this.service.searchQuery(),
      this.service.limit(),
      this.service.sort()
    ).subscribe();
  }

  async openForm(department: any = null) {
    const result = await this.modal.open(DepartmentFormComponent, {
      department
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
    this.service.fetchAll(1, false, this.service.searchQuery(), this.service.limit(), `${field}:${newDir}`).subscribe();
  }

  async onDelete(id: string) {
    const ok = await this.confirm.open({
      title: 'Hapus Department',
      message: 'Apakah Anda yakin ingin menghapus department ini?',
      confirmText: 'Hapus',
      cancelText: 'Batal'
    });

    if (ok) {
      this.toast.success('Berhasil dihapus');
      this.service.remove(id).subscribe({
        next: () => this.fetchData()
      });
    } else {
      this.toast.error('Gagal dihapus');
    }
  }
}

