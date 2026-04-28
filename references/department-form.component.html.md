<app-form-header
  [title]="department ? 'EDIT DEPARTEMEN' : 'TAMBAH DEPARTEMEN'"
  (cancelAction)="onCancel()"
></app-form-header>

<ion-content class="industrial-bg">
  <form
    [formGroup]="departmentForm"
    (ngSubmit)="onSave()"
    class="industrial-form"
  >
    <div class="form-section">
      <div class="section-title">KONFIGURASI DEPARTEMEN</div>

      <div class="error-banner" *ngIf="errorMessage()">
        <ion-icon name="alert-circle-outline"></ion-icon>
        <span>{{ errorMessage() }}</span>
      </div>

      <div class="field-group">
        <div class="input-container" [class.error]="isInvalid('name')">
          <ion-icon name="business-outline" slot="start"></ion-icon>
          <ion-input
            formControlName="name"
            placeholder="Contoh: HR"
            clearInput="true"
            fill="none"
            class="custom-input"
            autocapitalize="off"
          />
        </div>

        <ion-text
          color="danger"
          *ngIf="
            isInvalid('name') && !departmentForm.get('name')?.hasError('conflict')
          "
        >
          <small>Nama DEPARTEMEN wajib diisi</small>
        </ion-text>
        <ion-text
          color="danger"
          *ngIf="departmentForm.get('name')?.hasError('conflict')"
        >
          <small>Nama DEPARTEMEN sudah digunakan</small>
        </ion-text>
      </div>

      <div class="toggle-container">
        <div class="toggle-info">
          <span class="toggle-label">Status DEPARTEMEN</span>
          <span class="toggle-desc"
            >Matikan jika DEPARTEMEN tidak lagi tersedia</span
          >
        </div>
        <ion-toggle
          formControlName="isActive"
          slot="end"
          color="success"
        ></ion-toggle>
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn-save" [disabled]="loading()">
        @if (loading()) {
        <ion-spinner name="crescent"></ion-spinner>
        } @else {
        {{ department ? "PERBARUI DEPARTEMEN" : "SIMPAN DEPARTEMEN" }}
        }
      </button>
    </div>
  </form>
</ion-content>
