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
import { ToastService } from '../../shared/services/toast.service';
import { Employee } from '../../core/types/api.types';
import { ActivatedRoute, Router } from '@angular/router';

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
    if (employee) {
      this.router.navigate([employee.id], { relativeTo: this.route });
    } else {
      this.router.navigate(['new'], { relativeTo: this.route });
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
      title: 'Delete Employee',
      message: 'Are you sure you want to delete this employee?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (ok) {
      this.service.remove(id).subscribe({
        next: () => {
          this.toast.success('Successfully deleted');
          this.fetchData();
        },
        error: () => this.toast.error('Failed to delete employee'),
      });
    }
  }
}
