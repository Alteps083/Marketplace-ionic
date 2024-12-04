import { TestBed } from '@angular/core/testing';

import { MonedaServicioService } from './moneda-servicio.service';

describe('MonedaServicioService', () => {
  let service: MonedaServicioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonedaServicioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
