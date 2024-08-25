import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CambiarcontraPage } from './cambiarcontra.page';

describe('CambiarcontraPage', () => {
  let component: CambiarcontraPage;
  let fixture: ComponentFixture<CambiarcontraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CambiarcontraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
