import { Component, OnInit, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideSearch,
  LucidePlus,
  LucideChevronLeft,
  LucideChevronRight,
  LucideArrowUpDown,
  LucideTrash2,
  LucidePencil
} from '@lucide/angular';
import { DepartmentService } from '../../core/services/department.service';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';

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

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this department?')) {
      this.service.remove(id).subscribe();
    }
  }
}
