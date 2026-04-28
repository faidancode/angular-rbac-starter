import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonInput,
  IonSpinner,
  IonText,
  IonToggle,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, businessOutline } from 'ionicons/icons';
import { FormHeaderComponent } from 'src/app/components/form-header/form-header.component';
import { Department } from '../../core/models';
import {
  DepartmentPayload,
  DepartmentService,
} from '../../core/services/department.service';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonInput,
    IonToggle,
    IonIcon,
    IonSpinner,
    IonText,
    FormHeaderComponent,
  ],
  templateUrl: './department-form.component.html',
})
export class DepartmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private departmentService = inject(DepartmentService);
  constructor() {
    addIcons({ alertCircleOutline, businessOutline });
  }

  errorMessage = signal<string | null>(null);
  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);

  @Input() department: Department | null = null;

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

    // ✅ Angular-way: handle error reset di sini
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
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async onSave() {
    this.submitted.set(true);

    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    const payload = this.departmentForm.value as DepartmentPayload;
    this.loading.set(true);
    this.errorMessage.set(null);

    const request = this.department
      ? this.departmentService.update(this.department.id, payload)
      : this.departmentService.create(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.modalCtrl.dismiss(true, 'confirm');
      },
      error: (err) => {
        this.loading.set(false);

        if (err.statusCode === 409) {
          this.departmentForm.get('name')?.setErrors({ conflict: true });
          this.errorMessage.set(err.message || 'Nama jabatan sudah digunakan.');
        } else {
          this.errorMessage.set('Terjadi kesalahan sistem. Silakan coba lagi.');
        }
      },
    });
  }
}
