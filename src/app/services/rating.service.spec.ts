import { TestBed } from '@angular/core/testing';
import { RatingService } from './rating.service';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Si usas HttpClient
import { ServicebdService } from './servicebd.service';
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

describe('RatingService', () => {
  let service: RatingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Importa módulos necesarios
      providers: [
        RatingService,
        ServicebdService,
        { provide: SQLite, useClass: SQLiteMock },
        { provide: NativeStorage, useClass: NativeStorageMock }, // Agrega el mock de NativeStorage
      ],
    });
    service = TestBed.inject(RatingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
