import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideSearch, LucideMenu } from '@lucide/angular';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, LucideSearch, LucideMenu],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  auth = inject(AuthService);
  isCollapsed = signal(false);
  isDropdownOpen = signal(false);

  user = this.auth.currentUser;
  initials = computed(
    () =>
      this.user()
        ?.name?.split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ?? 'HR',
  );

  protected readonly LucideSearch = LucideSearch;
  protected readonly LucideMenu = LucideMenu;

  toggleDropdown() {
    this.isDropdownOpen.update((v) => !v);
  }

  logout() {
    this.auth.logout();
  }
}
