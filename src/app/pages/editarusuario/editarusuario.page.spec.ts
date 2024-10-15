import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarusuarioPage } from './editarusuario.page';

describe('EditarusuarioPage', () => {
  let component: EditarusuarioPage;
  let fixture: ComponentFixture<EditarusuarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarusuarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
