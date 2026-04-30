import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  effect,
  signal,
} from '@angular/core';
import { AbilityService } from '../services/ability.service';

// --- helper parser ---
function parsePermission(value: string): { action: string; subject: string } {
  const separator = value.includes(':') ? ':' : '.';
  const [subject, action] = value.split(separator);
  return { action, subject };
}

type PermissionInput =
  | string
  | string[]
  | { action: string; subject: string }
  | { action: string; subject: string }[];

@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private tpl = inject(TemplateRef<any>);
  private vcr = inject(ViewContainerRef);
  private ability = inject(AbilityService);

  private _permission = signal<PermissionInput>('');

  constructor() {
    effect(() => {
      this.vcr.clear();

      if (!this.ability.permissionsLoaded()) return;

      const perm = this._permission();

      let allowed = false;

      if (typeof perm === 'string') {
        const p = parsePermission(perm);
        allowed = this.ability.can(p.action, p.subject);
      } else if (Array.isArray(perm)) {
        allowed = perm.some((item) => {
          if (typeof item === 'string') {
            const p = parsePermission(item);
            return this.ability.can(p.action, p.subject);
          }
          return this.ability.can(item.action, item.subject);
        });
      } else {
        allowed = this.ability.can(perm.action, perm.subject);
      }

      if (allowed) {
        this.vcr.createEmbeddedView(this.tpl);
      }
    });
  }

  @Input()
  set hasPermission(value: PermissionInput) {
    this._permission.set(value);
  }
}
