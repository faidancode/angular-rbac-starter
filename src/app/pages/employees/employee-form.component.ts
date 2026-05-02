import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee, EmployeePayload } from '../../core/types/api.types';
import { EmployeeService } from '../../core/services/employee.service';
import { PositionService } from '../../core/services/position.service';
import { ToastService } from '../../shared/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  protected readonly positionService = inject(PositionService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  employee: Employee | null = null;
  isEdit = false;

  errorMessage = signal<string | null>(null);
  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);

  employeeForm: FormGroup = this.fb.group({
    nip: ['', [Validators.required]],
    fullName: ['', [Validators.required]],
    gender: ['', [Validators.required]],
    positionId: ['', [Validators.required]],
    employeeStatus: ['', [Validators.required]],
    isActive: [true],
    dateOfJoining: [''],
    dateOfActivePosition: [''],
  });

  ngOnInit() {
    if (!this.positionService.positions().length && !this.positionService.loading()) {
      const previousLimit = this.positionService.limit();

      this.positionService.fetchAll(1, false, '', 100).subscribe({
        next: () => this.positionService.updateLimit(previousLimit),
        error: () => this.positionService.updateLimit(previousLimit),
      });
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.isEdit = true;
        this.loading.set(true);
        this.employeeService.getById(id).subscribe({
          next: (res) => {
            this.employee = res.data;
            this.employeeForm.patchValue({
              nip: this.employee.nip,
              fullName: this.employee.fullName,
              gender: this.employee.gender,
              positionId: this.employee.positionId,
              employeeStatus: this.employee.employeeStatus,
              isActive: this.employee.isActive ?? true,
              dateOfJoining: this.toDateInputValue(this.employee.dateOfJoining),
              dateOfActivePosition: this.toDateInputValue(this.employee.dateOfActivePosition),
            });
            this.loading.set(false);
          },
          error: () => {
            this.toast.error('Gagal memuat data employee');
            this.onCancel();
          }
        });
      } else {
        this.isEdit = false;
      }
    });

    const nipControl = this.employeeForm.get('nip');
    nipControl?.valueChanges.subscribe(() => {
      this.errorMessage.set(null);
      if (nipControl.hasError('conflict')) {
        nipControl.setErrors(null);
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.employeeForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted()));
  }

  onCancel() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  onSave() {
    this.submitted.set(true);

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const payload: EmployeePayload = this.employeeForm.value;
    this.loading.set(true);
    this.errorMessage.set(null);

    const request = this.employee
      ? this.employeeService.update(this.employee.id, payload)
      : this.employeeService.create(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Berhasil disimpan');
        this.router.navigate(['..'], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error('Gagal disimpan');

        if (err.statusCode === 409) {
          this.employeeForm.get('nip')?.setErrors({ conflict: true });
          this.errorMessage.set(err.message || 'NIP sudah digunakan.');
        } else {
          this.errorMessage.set('Terjadi kesalahan sistem. Silakan coba lagi.');
        }
      },
    });
  }

  private toDateInputValue(value?: string | null): string {
    if (!value) {
      return '';
    }

    return value.includes('T') ? value.split('T')[0] : value.slice(0, 10);
  }
}
