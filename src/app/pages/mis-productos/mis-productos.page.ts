import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Producto } from 'src/app/services/producto';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';


@Component({
  selector: 'app-mis-productos',
  templateUrl: './mis-productos.page.html',
  styleUrls: ['./mis-productos.page.scss'],
})
export class MisProductosPage implements OnInit {
  profileImage: string | null = null;
  publicaciones: Producto[] | null = null;
  idusuario: number | null = null;
  usuario: Usuario | null = null;

  constructor(private router:Router, private bd: ServicebdService, private storage: NativeStorage) { }

  async ngOnInit() {
    this.usuario = this.bd.getUsuarioActual();
    if (this.usuario?.id !== undefined) {
      this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario.id);
    } else {
      console.error('El ID del usuario no está definido.');
      this.profileImage = 'ruta/a/nouser.png'; // Imagen predeterminada en caso de error
    }
    this.cargarUsuario();
  }

  cargarUsuario() {
    this.storage.getItem('usuario').then(async (data: Usuario) => {
      if (data) {
        this.usuario = data;
        try {
          this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario?.id || 0); // Aquí puedes usar 0 o un ID predeterminado
        } catch (error) {
          console.log('Error al cargar la imagen de perfil:', error);
        }
      }
    }).catch(error => {
      console.log('Error al recuperar usuario: ', JSON.stringify(error));
    });
  }

  cargarPublicaciones(){
    if(this.idusuario){
      this.bd.getPublicacionesPorUsuario(this.idusuario).then(publicaciones => {
        this.publicaciones = publicaciones;
      }).catch(e => {
        console.log('Error al cargar publicaciones', JSON.stringify(e));
      })
    }
  }

  irAVerPublicacion(id: number) {
    this.router.navigate(['/detalle', id]);
  }
  
  crear(){
    this.router.navigate(['tabs/agregar']);
  }

  perfil(){
    this.router.navigate(['tabs/perfil'])
  }

}
