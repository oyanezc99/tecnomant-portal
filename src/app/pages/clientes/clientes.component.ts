import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { esErrorDeConexion, mensajeDeError } from '../../core/errores';
import { Cliente, DatosCliente } from '../../core/modelos';
import { ToastService } from '../../core/toast.service';
import { ErrorConexionComponent } from '../../shared/error-conexion/error-conexion.component';
import { FilasEsqueletoComponent } from '../../shared/filas-esqueleto/filas-esqueleto.component';
import { ModalComponent } from '../../shared/modal/modal.component';

/** Mantenimiento de clientes: listar, buscar, crear, editar y eliminar. */
@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule, ErrorConexionComponent, FilasEsqueletoComponent, ModalComponent],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css',
  host: { class: 'pagina' },
})
export class ClientesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toast = inject(ToastService);

  readonly clientes = signal<Cliente[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);
  readonly busqueda = signal('');

  /** Filtra en pantalla por razón social, dirección y contacto, sin distinguir mayúsculas (A4). */
  readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return this.clientes().filter((cliente) =>
      [cliente.razonSocial, cliente.direccion, cliente.contacto ?? ''].some((campo) =>
        campo.toLowerCase().includes(texto),
      ),
    );
  });

  // Modal de nuevo cliente y de edición.
  readonly modalAbierto = signal(false);
  /** Cliente que se está editando, o `null` si el modal es de alta. */
  readonly enEdicion = signal<Cliente | null>(null);
  formulario = { razonSocial: '', direccion: '', contacto: '' };
  /** Campos obligatorios que se marcan en rojo. */
  readonly invalidos = signal({ razonSocial: false, direccion: false });
  readonly guardando = signal(false);

  // Confirmación de eliminar.
  readonly porEliminar = signal<Cliente | null>(null);
  readonly eliminando = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.api.clientes().subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorCarga.set(mensajeDeError(error));
        if (!esErrorDeConexion(error)) {
          this.toast.mostrar(mensajeDeError(error));
        }
      },
    });
  }

  /** Abre el modal vacío (nuevo cliente) o con los datos del cliente a editar. */
  abrirModal(cliente: Cliente | null = null): void {
    this.enEdicion.set(cliente);
    this.formulario = {
      razonSocial: cliente?.razonSocial ?? '',
      direccion: cliente?.direccion ?? '',
      contacto: cliente?.contacto ?? '',
    };
    this.invalidos.set({ razonSocial: false, direccion: false });
    this.modalAbierto.set(true);
  }

  guardar(): void {
    const datos: DatosCliente = {
      razonSocial: this.formulario.razonSocial.trim(),
      direccion: this.formulario.direccion.trim(),
      contacto: this.formulario.contacto.trim(),
    };
    // Un obligatorio vacío o con solo espacios se marca en rojo y no se envía nada (FR4.5, A5).
    const invalidos = { razonSocial: datos.razonSocial === '', direccion: datos.direccion === '' };
    this.invalidos.set(invalidos);
    if (invalidos.razonSocial || invalidos.direccion || this.guardando()) {
      return;
    }

    const editado = this.enEdicion();
    const llamada = editado ? this.api.editarCliente(editado.idCliente, datos) : this.api.crearCliente(datos);
    this.guardando.set(true);
    llamada.subscribe({
      next: (guardado) => {
        this.clientes.update((lista) =>
          editado
            ? lista.map((cliente) => (cliente.idCliente === editado.idCliente ? guardado : cliente))
            : [...lista, guardado],
        );
        this.guardando.set(false);
        this.modalAbierto.set(false);
      },
      error: (error: unknown) => {
        // El modal queda abierto para corregir o volver a intentar (A9).
        this.guardando.set(false);
        this.toast.mostrar(mensajeDeError(error));
      },
    });
  }

  confirmarEliminar(): void {
    const cliente = this.porEliminar();
    if (!cliente || this.eliminando()) {
      return;
    }
    this.eliminando.set(true);
    this.api.eliminarCliente(cliente.idCliente).subscribe({
      next: () => {
        this.clientes.update((lista) => lista.filter((otro) => otro.idCliente !== cliente.idCliente));
        this.eliminando.set(false);
        this.porEliminar.set(null);
      },
      error: (error: unknown) => {
        // El cliente sigue en la tabla. Sin conexión, la confirmación queda abierta para reintentar (A9).
        this.eliminando.set(false);
        if (!esErrorDeConexion(error)) {
          this.porEliminar.set(null);
        }
        this.toast.mostrar(mensajeDeError(error));
      },
    });
  }
}
