import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
    private toastService = inject(ToastService);

    toasts = this.toastService.toasts;

    remove(id: number) {
        this.toastService.remove(id);
    }
}