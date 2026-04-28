import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Department } from '../../core/types/api.types';
import { DepartmentService } from '../../core/services/department.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './department-form.component.html'
})
export class DepartmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  private toast = inject(ToastService);


  @Input() department: Department | null = null;

  @Output() success = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();

  errorMessage = signal<string | null>(null);
  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);

  departmentForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    isActive: [true],
  });

  ngOnInit() {
    if (this.department) {
      this.departmentForm.patchValue({
        name: this.department.name,
        isActive: this.department.isActive ?? true,
      });
    }

    const nameControl = this.departmentForm.get('name');
    nameControl?.valueChanges.subscribe(() => {
      this.errorMessage.set(null);
      if (nameControl.hasError('conflict')) {
        nameControl.setErrors(null);
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.departmentForm.get(controlName);
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.submitted())
    );
  }

  onCancel() {
    this.cancel.emit();
  }

  onSave() {
    this.submitted.set(true);

    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    const payload = this.departmentForm.value;
    this.loading.set(true);
    this.errorMessage.set(null);

    const request = this.department
      ? this.departmentService.update(this.department.id, payload)
      : this.departmentService.create(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.success.emit(true);
        this.toast.success('Berhasil disimpan');
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error('Gagal disimpan');

        if (err.statusCode === 409) {
          this.departmentForm.get('name')?.setErrors({ conflict: true });
          this.errorMessage.set(err.message || 'Nama departemen sudah digunakan.');
        } else {
          this.errorMessage.set('Terjadi kesalahan sistem. Silakan coba lagi.');
        }
      },
    });
  }
}