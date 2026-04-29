import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
import { EmployeeService } from '../../core/services/employee.service';
import { ModalService } from '../../core/services/modal.service';
import { ToastService } from '../../shared/services/toast.service';
import { Employee } from '../../core/types/api.types';
import { EmployeeFormComponent } from './employee-form.component';

@Component({
  selector: 'app-employees',
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
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
})
export class EmployeesComponent implements OnInit {
  protected readonly service = inject(EmployeeService);

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

  async openForm(employee: Employee | null = null) {
    const result = await this.modal.open(EmployeeFormComponent, {
      employee,
    });

    if (result) {
      this.fetchData();
    }
  }

  onSearch(query: string) {
    this.service
      .fetchAll(1, false, query, this.service.limit(), this.service.sort())
      .subscribe();
  }

  onLimitChange(limit: number) {
    this.service.updateLimit(limit);
    this.fetchData();
  }

  onPageChange(page: number) {
    this.service
      .fetchAll(page, false, this.service.searchQuery(), this.service.limit(), this.service.sort())
      .subscribe();
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

  displayGender(employee: Employee): string {
    return employee.genderLabel || employee.gender || '-';
  }

  displayStatus(employee: Employee): string {
    return employee.employeeStatusLabel || employee.employeeStatus || '-';
  }

  async onDelete(id: string) {
    const ok = await this.confirm.open({
      title: 'Hapus Employee',
      message: 'Apakah Anda yakin ingin menghapus employee ini?',
      confirmText: 'Hapus',
      cancelText: 'Batal',
    });

    if (ok) {
      this.toast.success('Berhasil dihapus');
      this.service.remove(id).subscribe({
        next: () => this.fetchData(),
      });
    }
  }
}
