import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';
import { esErrorDeConexion, mensajeDeError } from '../../core/errores';
import { Cliente, DatosCliente } from '../../core/modelos';
import { ToastService } from '../../core/toast.service';
import { ErrorConexionComponent } from '../../shared/error-conexion/error-conexion.component';
import { FilasEsqueletoComponent } from '../../shared/filas-esqueleto/filas-esqueleto.component';
import { ModalComponent } from '../../shared/modal/modal.component';

/** Mantenimiento de clientes: listar, buscar, paginar, exportar, crear, editar y eliminar. */
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

  // Paginación
  readonly paginaActual = signal(1);
  readonly registrosPorPagina = signal(10);

  /** Filtra en pantalla por razón social, dirección y contacto. */
  readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return this.clientes().filter((cliente) =>
      [cliente.razonSocial, cliente.direccion, cliente.contacto ?? ''].some((campo) =>
        campo.toLowerCase().includes(texto),
      ),
    );
  });

  /** Clientes paginados según la página actual y el tamaño de página seleccionado. */
  readonly clientesPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.registrosPorPagina();
    return this.filtrados().slice(inicio, inicio + this.registrosPorPagina());
  });

  readonly totalPaginas = computed(() => {
    return Math.max(1, Math.ceil(this.filtrados().length / this.registrosPorPagina()));
  });

  // Modal de nuevo cliente y de edición.
  readonly modalAbierto = signal(false);
  readonly enEdicion = signal<Cliente | null>(null);
  formulario = { razonSocial: '', direccion: '', contacto: '' };
  
  /** Campos obligatorios e inválidos con validador de Regex para contacto. */
  readonly invalidos = signal({ razonSocial: false, direccion: false, contacto: false });
  readonly mensajeContactoInvalido = signal('');
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

  cambiarBusqueda(valor: string): void {
    this.busqueda.set(valor);
    this.paginaActual.set(1); // Reiniciar a la primera página al buscar
  }

  cambiarRegistrosPorPagina(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.registrosPorPagina.set(Number(select.value));
    this.paginaActual.set(1);
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas()) {
      this.paginaActual.set(nuevaPagina);
    }
  }

  /** Exporta la lista filtrada actual a un archivo CSV descargable */
  exportarCSV(): void {
    const datos = this.filtrados();
    if (datos.length === 0) {
      this.toast.mostrar('No hay datos para exportar.');
      return;
    }

    const encabezados = ['Id', 'Razon Social', 'Direccion', 'Contacto'];
    const filas = datos.map((c) => [
      c.idCliente,
      `"${(c.razonSocial || '').replace(/"/g, '""')}"`,
      `"${(c.direccion || '').replace(/"/g, '""')}"`,
      `"${(c.contacto || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [encabezados.join(','), ...filas.map((e) => e.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const enlace = document.createElement('a');
    enlace.setAttribute('href', url);
    enlace.setAttribute('download', `reporte_clientes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  }

  abrirModal(cliente: Cliente | null = null): void {
    this.enEdicion.set(cliente);
    this.formulario = {
      razonSocial: cliente?.razonSocial ?? '',
      direccion: cliente?.direccion ?? '',
      contacto: cliente?.contacto ?? '',
    };
    this.invalidos.set({ razonSocial: false, direccion: false, contacto: false });
    this.mensajeContactoInvalido.set('');
    this.modalAbierto.set(true);
  }

  guardar(): void {
    const razonSocial = this.formulario.razonSocial.trim();
    const direccion = this.formulario.direccion.trim();
    const contacto = this.formulario.contacto.trim();

    // Regex para validar teléfono / contacto (permite números, espacios, +, -, y paréntesis, de 7 a 15 dígitos)
    const regexTelefono = /^$\vert{}^[\+]?[(]?\d{3}[)]?[-\s\.]?\d{3}[-\s\.]?\d{4,6}$/;
    const contactoInvalido = contacto !== '' && !regexTelefono.test(contacto);

    if (contactoInvalido) {
      this.mensajeContactoInvalido.set('Formato de teléfono o contacto inválido.');
    } else {
      this.mensajeContactoInvalido.set('');
    }

    const invalidos = {
      razonSocial: razonSocial === '',
      direccion: direccion === '',
      contacto: contactoInvalido,
    };

    this.invalidos.set(invalidos);

    if (invalidos.razonSocial || invalidos.direccion || invalidos.contacto || this.guardando()) {
      return;
    }

    const datos: DatosCliente = { razonSocial, direccion, contacto };
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
        this.eliminando.set(false);
        if (!esErrorDeConexion(error)) {
          this.porEliminar.set(null);
        }
        this.toast.mostrar(mensajeDeError(error));
      },
    });
  }
}