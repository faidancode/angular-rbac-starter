import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideShieldAlert } from '@lucide/angular';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink, LucideShieldAlert],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full text-center space-y-8">
        <div>
          <lucide-icon [name]="LucideShieldAlert" class="mx-auto h-24 w-24 text-red-500"></lucide-icon>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">403 - Forbidden</h2>
          <p class="mt-2 text-sm text-gray-600">
            You do not have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
        </div>
        <div>
          <a routerLink="/dashboard" class="text-indigo-600 hover:text-indigo-500 font-medium">
            Go back to Dashboard
          </a>
        </div>
      </div>
    </div>
  `,
})
export class ForbiddenComponent {
  protected readonly LucideShieldAlert = LucideShieldAlert;
}
