import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeadminPage } from './homeadmin.page';

describe('HomeadminPage', () => {
  let component: HomeadminPage;
  let fixture: ComponentFixture<HomeadminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeadminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
