import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroPage } from './registro.page';
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

describe('RegistroPage', () => {
  let component: RegistroPage;
  let fixture: ComponentFixture<RegistroPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistroPage],
      imports: [IonicModule.forRoot()],
      providers: [
        ServicebdService,
        { provide: SQLite, useClass: SQLiteMock }, // Mock de SQLite
        { provide: NativeStorage, useClass: NativeStorageMock },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(RegistroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Verificar si se habilita el boton de registro al llenar el formulario', () => {

    const miFormulario = component.miFormulario;
    const nombreControl = miFormulario.get('nombre');
    const emailControl = miFormulario.get('email');
    const phoneControl = miFormulario.get('phone');
    const passwordControl = miFormulario.get('password');
    const confirmPasswordControl = miFormulario.get('confirmPassword');

    nombreControl?.setValue('UsuarioTest');
    emailControl?.setValue('usuario@test.com');
    phoneControl?.setValue('56912345678');
    passwordControl?.setValue('Password@123');
    confirmPasswordControl?.setValue('Password@123');

    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.css('.button-registrar')).nativeElement;
    expect(submitButton.disabled).toBeFalse();
  });
});
