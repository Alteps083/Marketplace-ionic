import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificacionesPage } from './notificaciones.page';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs'; // Para crear un observable de prueba
import { IonicModule } from '@ionic/angular';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';


// Mock de SQLite para pruebas
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

describe('NotificacionesPage', () => {
  let component: NotificacionesPage;
  let fixture: ComponentFixture<NotificacionesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificacionesPage],
      imports: [IonicModule.forRoot()],
      providers: [
        ServicebdService,
        { provide: SQLite, useClass: SQLiteMock }, // Mock de SQLite
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
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(NotificacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
