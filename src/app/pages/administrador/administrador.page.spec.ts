import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministradorPage } from './administrador.page';

describe('AdministradorPage', () => {
  let component: AdministradorPage;
  let fixture: ComponentFixture<AdministradorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministradorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
