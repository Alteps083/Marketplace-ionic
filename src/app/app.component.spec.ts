import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IonicModule, ModalController, Platform, AlertController, MenuController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AppComponent } from './app.component';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { ServicebdService } from './services/servicebd.service';
import { NotificationsPushService } from './services/notifications-push.service';
import { of } from 'rxjs';

// Mock para ModalController
class ModalControllerMock {
  create() {
    return {
      present: () => Promise.resolve(),
      dismiss: () => Promise.resolve(),
    };
  }
}

// Mock para NativeStorage
class NativeStorageMock {
  clear() {
    return Promise.resolve();
  }
}

// Mock para ServicebdService
class ServicebdServiceMock {
  crearConexion() {}
  cargarUsuarioActual() {
    return Promise.resolve();
  }
  cargarUsuarios() {
    return Promise.resolve();
  }
  verificarYAgregarColumnaEstado() {
    return Promise.resolve();
  }
  getUsuarioActual() {
    return { es_admin: true };
  }
}

// Mock para ActivatedRoute
class ActivatedRouteMock {
  // Simula parámetros de la ruta
  params = of({ id: 'test-id' });
}

describe('AppComponent', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useClass: ModalControllerMock },
        { provide: NativeStorage, useClass: NativeStorageMock },
        { provide: ServicebdService, useClass: ServicebdServiceMock },
        { provide: NotificationsPushService, useValue: {} }, // Mock vacío si no necesitas funcionalidad específica
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
        Platform,
        AlertController,
        MenuController,
        Router,
        Location,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
