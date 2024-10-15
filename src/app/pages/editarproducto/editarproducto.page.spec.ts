import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarproductoPage } from './editarproducto.page';

describe('EditarproductoPage', () => {
  let component: EditarproductoPage;
  let fixture: ComponentFixture<EditarproductoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarproductoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
