import { TestBed } from '@angular/core/testing';
import { DetallePage } from './detalle.page';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs'; // Para crear un observable de prueba
import { IonicModule } from '@ionic/angular'; // Importar IonicModule
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Si usas HttpClient


class SQLiteMock {
  create() {
    return Promise.resolve({
      executeSql: () => Promise.resolve(),
      transaction: () => Promise.resolve(),
      close: () => Promise.resolve(),
    });
  }
}

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

describe('DetallePage', () => {
  let component: DetallePage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetallePage],
      imports: [IonicModule.forRoot(), HttpClientTestingModule], // Agregar IonicModule
      providers: [
        { provide: SQLite, useClass: SQLiteMock },
        { provide: NativeStorage, useClass: NativeStorageMock },
        { 
          provide: ActivatedRoute, 
          useValue: { 
            snapshot: { 
              paramMap: { get: () => 'mock-id' } 
            },
            params: of({ id: 'mock-id' })  // Simula parámetros de la ruta
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(DetallePage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Agrega más pruebas si es necesario
});
