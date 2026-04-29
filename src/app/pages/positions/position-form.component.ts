import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Position } from '../../core/types/api.types';
import { PositionService } from '../../core/services/position.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-position-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './position-form.component.html',
})
export class PositionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private positionService = inject(PositionService);
  private toast = inject(ToastService);

  @Input() position: Position | null = null;

  @Output() success = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();

  errorMessage = signal<string | null>(null);
  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);

  positionForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    isActive: [true],
  });

  ngOnInit() {
    if (this.position) {
      this.positionForm.patchValue({
        name: this.position.name,
        isActive: this.position.isActive ?? true,
      });
    }

    const nameControl = this.positionForm.get('name');
    nameControl?.valueChanges.subscribe(() => {
      this.errorMessage.set(null);
      if (nameControl.hasError('conflict')) {
        nameControl.setErrors(null);
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.positionForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitted()));
  }

  onCancel() {
    this.cancel.emit();
  }

  onSave() {
    this.submitted.set(true);

    if (this.positionForm.invalid) {
      this.positionForm.markAllAsTouched();
      return;
    }

    const payload = this.positionForm.value;
    this.loading.set(true);
    this.errorMessage.set(null);

    const request = this.position
      ? this.positionService.update(this.position.id, payload)
      : this.positionService.create(payload);

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
          this.positionForm.get('name')?.setErrors({ conflict: true });
          this.errorMessage.set(err.message || 'Nama departemen sudah digunakan.');
        } else {
          this.errorMessage.set('Terjadi kesalahan sistem. Silakan coba lagi.');
        }
      },
    });
  }
}
