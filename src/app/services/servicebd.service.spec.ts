import { TestBed } from '@angular/core/testing';
import { ServicebdService } from './servicebd.service';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Si usas HttpClient
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';

class SQLiteMock {
  create(config: any) {
    return Promise.resolve({
      executeSql: () => Promise.resolve({ rows: [] }),
      transaction: (callback: Function) => {
        const tx = { executeSql: () => Promise.resolve() };
        callback(tx);
      },
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

describe('ServicebdService', () => {
  let service: ServicebdService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Importa módulos necesarios
      providers: [
        { provide: SQLite, useClass: SQLiteMock }, // Usa el mock de SQLite
        { provide: NativeStorage, useClass: NativeStorageMock },
      ],
    });
    service = TestBed.inject(ServicebdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Aquí puedes agregar más pruebas para funciones específicas de tu servicio
});
