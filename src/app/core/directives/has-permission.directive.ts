import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  effect,
  signal,
} from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({ selector: '[hasPermission]', standalone: true })
export class HasPermissionDirective {
  private tpl = inject(TemplateRef<any>);
  private vcr = inject(ViewContainerRef);
  private auth = inject(AuthService);

  private _permission = signal<string>('');

  constructor() {
    // Re-evaluate whenever permissions signal changes
    effect(() => {
      this.vcr.clear();
      if (this.auth.hasPermission(this._permission())) {
        this.vcr.createEmbeddedView(this.tpl);
      }
    });
  }

  @Input() set hasPermission(perm: string) {
    this._permission.set(perm);
  }
}
