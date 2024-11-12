import { TestBed } from '@angular/core/testing';
import { NotificationsPushService } from './notifications-push.service';

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

describe('NotificationsPushService', () => {
  let service: NotificationsPushService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationsPushService,
        ServicebdService,
        { provide: SQLite, useClass: SQLiteMock },
        { provide: NativeStorage, useClass: NativeStorageMock }, // Agrega el mock de NativeStorage
      ],
    });
    service = TestBed.inject(NotificationsPushService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
