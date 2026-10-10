import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

/**
 * Ventana modal reutilizable. Quien la usa decide cuándo mostrarla y la quita
 * cuando recibe `cerrar` (botón ✕ o tecla Esc).
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  @Input() titulo = '';
  @Output() cerrar = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  alPulsarEscape(): void {
    this.cerrar.emit();
  }
}
