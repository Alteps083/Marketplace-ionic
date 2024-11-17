import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OlvidoContraseniaPage } from './olvido-contrasenia.page';

describe('OlvidoContraseniaPage', () => {
  let component: OlvidoContraseniaPage;
  let fixture: ComponentFixture<OlvidoContraseniaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OlvidoContraseniaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
