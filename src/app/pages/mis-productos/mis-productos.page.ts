import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { AlertController } from '@ionic/angular';
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
  publicaciones: Producto[] = [];
  idusuario: number | null = null;
  usuario: Usuario | null = null;

  constructor(private router:Router, private bd: ServicebdService, private storage: NativeStorage, private alert: AlertController) { }

  async ngOnInit() {
    this.usuario = this.bd.getUsuarioActual();
    if (this.usuario?.id !== undefined) {
      this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario.id);
      this.idusuario = this.usuario.id;
      this.cargarPublicaciones();
    } else {
      console.error('El ID del usuario no está definido.');
      this.profileImage = 'ruta/a/nouser.png'; 
    }
    this.cargarUsuario();
  }

  eliminarPublicacion(id: number) {
    this.bd.eliminarProducto(id).then(() => {
      this.publicaciones = this.publicaciones?.filter(p => p.id !== id);
      console.log(`Publicación con ID ${id} eliminada.`);
    }).catch(err => {
      console.error('Error al eliminar:', err);
    });
  }

  async confirmarEliminacion(producto: any) {
    const alert = await this.alert.create({
      header: 'Eliminar Publicación',
      message: `
        ${producto.nombre_producto}
        ${producto.precio}
        ${producto.estado}
      `,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          },
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarPublicacion(producto.id);
          },
        },
      ],
    });

    await alert.present();
  }

  cargarUsuario() {
    this.storage.getItem('usuario_actual').then(async (data: Usuario) => {
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

  cargarPublicaciones() {
    this.storage.getItem('usuario_actual')
      .then((usuario: { id: number } | null) => {
        if (usuario?.id) {
          return this.bd.getPublicacionesPorUsuario(usuario.id); 
        } else {
          throw new Error('No se encontró el ID de usuario en NativeStorage');
        }
      })
      .then(publicaciones => {
        this.publicaciones = publicaciones;
      })
      .catch(e => {
        console.log('Error al cargar publicaciones:', e.message || JSON.stringify(e));
      });
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
