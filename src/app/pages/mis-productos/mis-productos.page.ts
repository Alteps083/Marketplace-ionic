import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Producto } from 'src/app/services/producto';
import { ServicebdService } from 'src/app/services/servicebd.service';

@Component({
  selector: 'app-mis-productos',
  templateUrl: './mis-productos.page.html',
  styleUrls: ['./mis-productos.page.scss'],
})
export class MisProductosPage implements OnInit {
  profileImage: string | null = null;
  publicaciones: Producto[] | null = null;
  idusuario: number | null = null;

  constructor(private router:Router, private bd: ServicebdService, private storage: NativeStorage) { }

  async ngOnInit() {
    this.cargarUsuario();
    const usuarioActual = this.bd.getUsuarioActual();
    if (usuarioActual && usuarioActual.nombre) {
      this.profileImage = await this.bd.obtenerImagenUsuario(usuarioActual.nombre);
    }
  }

  cargarUsuario() {
    this.storage.getItem('usuario').then((data: any) => {
      this.idusuario = data.id; 
      this.cargarPublicaciones();
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
}
