import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarPage } from './agregar.page';
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

describe('AgregarPage', () => {
  let component: AgregarPage;
  let fixture: ComponentFixture<AgregarPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarPage],
      imports: [IonicModule.forRoot()],
      providers: [
        ServicebdService,
        { provide: SQLite, useClass: SQLiteMock }, // Mock de SQLite
        { provide: NativeStorage, useClass: NativeStorageMock },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AgregarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Verifica si el boton de agregar se habilita con todos los campos llenos', () => {
    component.miFormulario.controls['titulo'].setValue('Producto de Prueba');
    component.miFormulario.controls['precio'].setValue(1000);
    component.miFormulario.controls['categoria'].setValue('Procesador');
    component.miFormulario.controls['estado'].setValue('nuevo');
    component.miFormulario.controls['descripcion'].setValue('Esta es una descripción válida con más de 50 caracteres para cumplir con la validación.');

    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.css('ion-button[type="submit"]')).nativeElement;
    expect(submitButton.disabled).toBeFalse();  
  });
});
