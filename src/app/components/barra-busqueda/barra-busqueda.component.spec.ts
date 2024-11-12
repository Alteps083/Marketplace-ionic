import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { BarraBusquedaComponent } from './barra-busqueda.component';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';

// Mock de SQLite para evitar su implementación real en las pruebas
class SQLiteMock {
  create() {
    return Promise.resolve({
      executeSql: () => Promise.resolve(),
      transaction: () => Promise.resolve(),
      close: () => Promise.resolve(),
    });
  }
}

// Mock de NativeStorage para evitar su implementación real en las pruebas
class NativeStorageMock {
  getItem() {
    return Promise.resolve();
  }
  setItem() {
    return Promise.resolve();
  }
  remove() {
    return Promise.resolve();
  }
}


describe('BarraBusquedaComponent', () => {
  let component: BarraBusquedaComponent;
  let fixture: ComponentFixture<BarraBusquedaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BarraBusquedaComponent ],
      imports: [IonicModule.forRoot()],
      providers: [
        BarraBusquedaComponent,
        ServicebdService,
        { provide: SQLite, useClass: SQLiteMock },
        { provide: NativeStorage, useClass: NativeStorageMock },],
    }).compileComponents();

    fixture = TestBed.createComponent(BarraBusquedaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
