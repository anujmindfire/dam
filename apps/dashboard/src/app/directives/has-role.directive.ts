import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Structural directive that shows/hides an element based on the user's roleId.
 *
 * Usage:
 *   <button *hasRole="1">Admin-only button</button>
 *   <div *hasRole="[1, 2]">Visible for roles 1 and 2</div>
 *
 * Role IDs:
 *   1 = admin
 *   2 = manager
 *   3 = viewer
 */
@Directive({
  selector: '[hasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit {
  @Input('hasRole') requiredRole!: number | number[];

  private hasView = false;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    const user = this.authService.currentUser;
    const userRole = user?.roleId;

    const allowed = Array.isArray(this.requiredRole)
      ? this.requiredRole
      : [this.requiredRole];

    if (userRole != null && allowed.includes(userRole) && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if ((userRole == null || !allowed.includes(userRole)) && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
