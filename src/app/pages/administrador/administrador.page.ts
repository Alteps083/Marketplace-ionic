import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.page.html',
  styleUrls: ['./administrador.page.scss'],
})
export class AdministradorPage {

  usuarioActual: Usuario | null = null;

  profileImage: string | null = null;

  usuario: Usuario | null = null;

  currentIndex = 0;

  tablaSeleccionada: string = '';  // Para almacenar la tabla seleccionada
  usuarios = [
    { id: 1, nombre: 'Usuario 1', email: 'usuario1@example.com' },
    { id: 2, nombre: 'Usuario 2', email: 'usuario2@example.com' }
  ];
  productos = [
    { id: 1, nombre: 'Producto 1', precio: '$10' },
    { id: 2, nombre: 'Producto 2', precio: '$20' }
  ];

  constructor(private router:Router, private bd: ServicebdService, private storage: NativeStorage) {}

  mostrarTabla(tabla: string) {
    this.tablaSeleccionada = tabla;  // Cambia la tabla que se va a mostrar
  }

  async ngOnInit() {
    this.usuarioActual = this.bd.getUsuarioActual();
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const user = navigation.extras.state['user'];
      if (user) {
        this.usuario = user.usuario;
        console.log('Usuario recibido:', this.usuario);
      }

    }

    const usuarioActual = this.bd.getUsuarioActual();
    if (usuarioActual && usuarioActual.nombre) {
      this.profileImage = await this.bd.obtenerImagenUsuario(usuarioActual.nombre);
    }
  }

  cargarUsuario(){
    this.storage.getItem('usuario').then((data: Usuario) => {
      if(data) {
        this.usuario = data;
      }
    }).catch(error => {
      console.log('Error al recuperar usuario: ', JSON.stringify(error));
    });
  }



}
