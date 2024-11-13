import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { IonicModule } from '@ionic/angular';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { By } from '@angular/platform-browser';

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

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [IonicModule.forRoot()],
      providers: [
        ServicebdService,
        { provide: SQLite, useClass: SQLiteMock }, // Mock de SQLite
        { provide: NativeStorage, useClass: NativeStorageMock },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Verifica que los mensajes de error aparezcan cuando los campos no cumplen con las validaciones.', () => {
    const nombreControl = component.miFormulario.controls['nombre'];
    nombreControl.setValue('');
    nombreControl.markAsTouched();

    fixture.detectChanges(); 
  
    const errorElement = fixture.debugElement.query(By.css('ion-text[color="danger"]')).nativeElement;
    expect(errorElement.textContent).toContain('Debe Ingresar el Nombre');
  });
});
