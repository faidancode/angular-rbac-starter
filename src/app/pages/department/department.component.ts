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
  template: `
    <div class="department-container">
      
      <header class="department-header">
        <div class="header-content">
          <h2>Departments</h2>
          <p>Organizational structure and functional units.</p>
        </div>
        
        <div class="header-actions">
          <div class="search-field">
            <svg lucideSearch class="search-icon" [size]="18"></svg>
            <input 
              type="text" 
              placeholder="Search units..." 
              [ngModel]="service.searchQuery()"
              (ngModelChange)="onSearch($event)"
            />
          </div>
          
          <button *hasPermission="'Department:create'" class="primary-button">
            <svg lucidePlus [size]="18"></svg>
            <span>Add Department</span>
          </button>
        </div>
      </header>

      <div class="hris-table-wrapper">
        <div class="table-header-toolbar">
          <div class="toolbar-left">
            <span class="title">All Departments</span>
            <span class="subtitle">
              Total {{ service.total() }} Units
            </span>
          </div>

          <select 
            [ngModel]="service.limit()" 
            (ngModelChange)="onLimitChange($event)"
            class="limit-select"
          >
            <option [value]="10">Show 10</option>
            <option [value]="25">Show 25</option>
          </select>
        </div>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th class="sortable" (click)="toggleSort('name')">
                  Name <svg lucideArrowUpDown [size]="14"></svg>
                </th>
                <th>Status</th>
                <th class="sortable" (click)="toggleSort('createdAt')">
                  Created <svg lucideArrowUpDown [size]="14"></svg>
                </th>
                <th style="text-align: right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (service.loading()) {
                @for (i of [1,2,3]; track i) {
                  <tr class="animate-pulse">
                    <td colspan="4"><div class="loading-skeleton"></div></td>
                  </tr>
                }
              } @else {
                @for (dept of service.departments(); track dept.id) {
                  <tr>
                    <td style="font-weight: 700">{{ dept.name }}</td>
                    <td>
                      <span class="hris-badge" [ngClass]="dept.isActive ? 'badge-success' : 'badge-danger'">
                        {{ dept.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase">
                      {{ dept.createdAt | date:'dd MMM yyyy' }}
                    </td>
                    <td>
                      <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.25rem">
                        <button class="action-icon-btn">
                          <svg lucidePencil [size]="16"></svg>
                        </button>
                        <button (click)="onDelete(dept.id)" class="action-icon-btn delete">
                          <svg lucideTrash2 [size]="16"></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <div class="pagination-toolbar">
          <span class="page-info">
            Page {{ service.page() }}
          </span>
          
          <div class="page-controls">
            <button 
              class="page-btn-minimal" 
              [disabled]="service.page() === 1"
              (click)="onPageChange(service.page() - 1)"
            >
              <svg lucideChevronLeft [size]="18"></svg>
            </button>
            <button 
              class="page-btn-minimal" 
              [disabled]="!service.hasMore()"
              (click)="onPageChange(service.page() + 1)"
            >
              <svg lucideChevronRight [size]="18"></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
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
