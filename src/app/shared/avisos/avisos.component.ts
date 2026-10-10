import { Component, inject } from '@angular/core';

import { ToastService } from '../../core/toast.service';

/** Dibuja en pantalla los avisos (toasts) que mantiene `ToastService`. */
@Component({
  selector: 'app-avisos',
  standalone: true,
  templateUrl: './avisos.component.html',
  styleUrl: './avisos.component.css',
})
export class AvisosComponent {
  readonly toast = inject(ToastService);
}
