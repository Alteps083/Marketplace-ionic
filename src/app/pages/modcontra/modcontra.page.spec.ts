import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModcontraPage } from './modcontra.page';

describe('ModcontraPage', () => {
  let component: ModcontraPage;
  let fixture: ComponentFixture<ModcontraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModcontraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
