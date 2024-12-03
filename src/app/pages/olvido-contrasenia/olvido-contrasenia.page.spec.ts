import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { OlvidoContraseniaPage } from './olvido-contrasenia.page';


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

describe('OlvidoContraseniaPage', () => {
  let component: OlvidoContraseniaPage;
  let fixture: ComponentFixture<OlvidoContraseniaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OlvidoContraseniaPage],
      imports: [IonicModule.forRoot()],
      providers: [
        ServicebdService,
        { provide: SQLite, useClass: SQLiteMock }, // Mock de SQLite
        { provide: NativeStorage, useClass: NativeStorageMock },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OlvidoContraseniaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
