import { TestBed } from '@angular/core/testing';
import { DetallePage } from './detalle.page';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs'; 
import { IonicModule } from '@ionic/angular'; 
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { ComponentFixture } from '@angular/core/testing'; 


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
  let fixture: ComponentFixture<DetallePage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetallePage],
      imports: [IonicModule.forRoot(), HttpClientTestingModule], 
      providers: [
        { provide: SQLite, useClass: SQLiteMock },
        { provide: NativeStorage, useClass: NativeStorageMock },
        { 
          provide: ActivatedRoute, 
          useValue: { 
            snapshot: { 
              paramMap: { get: () => 'mock-id' } 
            },
            params: of({ id: 'mock-id' })  
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetallePage);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });
    
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe deshabilitar el botón "Publicar" cuando "nuevoComentario" esté vacío', () => {
    component.nuevoComentario = '';
    expect(component.isPublicarDisabled()).toBeTrue();
  });

  it('debe deshabilitar el botón "Publicar" cuando "nuevoComentario" contenga solo espacios', () => {
    component.nuevoComentario = '   ';
    expect(component.isPublicarDisabled()).toBeTrue();
  });

  it('debe habilitar el botón "Publicar" cuando "nuevoComentario" tenga texto válido', () => {
    component.nuevoComentario = 'Comentario válido';
    expect(component.isPublicarDisabled()).toBeFalse();
  });
});