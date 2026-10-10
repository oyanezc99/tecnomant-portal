import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    });
  });

  it('se crea y contiene la salida del router y los avisos', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const raiz: HTMLElement = fixture.nativeElement;

    expect(fixture.componentInstance).toBeTruthy();
    expect(raiz.querySelector('router-outlet')).not.toBeNull();
    expect(raiz.querySelector('app-avisos')).not.toBeNull();
  });
});
