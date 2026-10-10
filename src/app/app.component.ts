import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AvisosComponent } from './shared/avisos/avisos.component';

/** Raíz de la aplicación: solo aloja la pantalla activa y los avisos. */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AvisosComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
