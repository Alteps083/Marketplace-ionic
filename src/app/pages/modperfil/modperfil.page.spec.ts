import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModperfilPage } from './modperfil.page';

describe('ModperfilPage', () => {
  let component: ModperfilPage;
  let fixture: ComponentFixture<ModperfilPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModperfilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
