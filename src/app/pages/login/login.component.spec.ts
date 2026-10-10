import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { RespuestaLogin } from '../../core/modelos';
import { ToastService } from '../../core/toast.service';
import { SESION, buscar, errorDeApi, errorSinConexion, escribir } from '../../testing/datos-prueba';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  const ADMIN: RespuestaLogin = { rol: 'admin', idTecnico: null, nombre: 'Administrador' };
  const TECNICO: RespuestaLogin = { rol: 'tecnico', idTecnico: 1, nombre: 'Tecnico Prueba 1' };
  const CLAVE_SESION = 'tecnomant.sesion';

  let api: jasmine.SpyObj<ApiService>;
  let toast: jasmine.SpyObj<ToastService>;
  let navegar: jasmine.Spy;
  let fixture: ComponentFixture<LoginComponent>;
  let raiz: HTMLElement;

  /** Escribe usuario y clave y pulsa Ingresar. */
  function ingresar(): void {
    escribir(raiz, 'login-usuario', 'usuario-de-prueba');
    escribir(raiz, 'login-clave', 'clave-de-prueba');
    buscar(raiz, 'login-ingresar').click();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    sessionStorage.clear();
    api = jasmine.createSpyObj<ApiService>('ApiService', ['login']);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['mostrar']);
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: api },
        { provide: ToastService, useValue: toast },
      ],
    });
    navegar = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(LoginComponent);
    raiz = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => sessionStorage.clear());

  it('muestra "Iniciar sesión", los campos Usuario y Clave (de tipo clave) y el botón Ingresar (FR1.1)', () => {
    expect(raiz.querySelector('h1')?.textContent).toContain('Iniciar sesión');
    expect(raiz.textContent).toContain('Usuario');
    expect(raiz.textContent).toContain('Clave');
    expect(buscar<HTMLInputElement>(raiz, 'login-usuario').type).toBe('text');
    expect(buscar<HTMLInputElement>(raiz, 'login-clave').type).toBe('password');
    expect(buscar(raiz, 'login-ingresar').textContent).toContain('Ingresar');
  });

  it('mientras espera la respuesta, el botón está desactivado y muestra el spinner (FR1.2)', () => {
    const respuesta = new Subject<RespuestaLogin>();
    api.login.and.returnValue(respuesta);

    ingresar();

    expect(api.login).toHaveBeenCalledOnceWith('usuario-de-prueba', 'clave-de-prueba');
    expect(buscar<HTMLButtonElement>(raiz, 'login-ingresar').disabled).toBeTrue();
    expect(buscar(raiz, 'login-spinner')).not.toBeNull();

    respuesta.next(ADMIN);
    fixture.detectChanges();
    expect(buscar<HTMLButtonElement>(raiz, 'login-ingresar').disabled).toBeFalse();
    expect(buscar(raiz, 'login-spinner')).toBeNull();
  });

  it('con rol "admin" guarda la sesión y navega a /dashboard (FR1.3)', () => {
    api.login.and.returnValue(of(ADMIN));

    ingresar();

    expect(JSON.parse(sessionStorage.getItem(CLAVE_SESION) ?? 'null')).toEqual(SESION);
    expect(navegar).toHaveBeenCalledOnceWith(['/dashboard']);
  });

  it('con rol "tecnico" muestra "Este portal es solo para administradores", no guarda sesión y no navega (FR1.4)', () => {
    api.login.and.returnValue(of(TECNICO));

    ingresar();

    expect(buscar(raiz, 'login-mensaje').textContent).toContain('Este portal es solo para administradores');
    expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('con 401 muestra "Usuario o clave incorrectos" y aplica la sacudida (FR1.5)', () => {
    api.login.and.returnValue(throwError(() => errorDeApi(401, 'Usuario o clave incorrectos')));

    ingresar();

    expect(buscar(raiz, 'login-mensaje').textContent).toContain('Usuario o clave incorrectos');
    expect(buscar(raiz, 'login-tarjeta').classList).toContain('sacudir');
    expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull();
    expect(navegar).not.toHaveBeenCalled();
  });

  it('si la API no responde, muestra el aviso "No se pudo conectar con la API" (FR7.1, A9)', () => {
    api.login.and.returnValue(throwError(() => errorSinConexion()));

    ingresar();

    expect(toast.mostrar).toHaveBeenCalledOnceWith('No se pudo conectar con la API');
    expect(buscar(raiz, 'login-tarjeta').classList).not.toContain('sacudir');
    expect(buscar<HTMLButtonElement>(raiz, 'login-ingresar').disabled).toBeFalse();
  });
});
