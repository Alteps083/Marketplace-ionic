import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicioClientePage } from './servicio-cliente.page';

describe('ServicioClientePage', () => {
  let component: ServicioClientePage;
  let fixture: ComponentFixture<ServicioClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicioClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
