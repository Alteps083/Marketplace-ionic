import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Producto } from 'src/app/services/producto';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.page.html',
  styleUrls: ['./busqueda.page.scss'],
})
export class BusquedaPage implements OnInit {

  productosFiltrados: Producto[] = [];
  productos: Producto[] = [];
  searchTerm: string = '';
  profileImage: string | null = null;
  usuario: Usuario | null = null;

  constructor(private bd: ServicebdService, private router: Router, private storage: NativeStorage) { }

  async ngOnInit() {
    await this.cargarUsuario();
    await this.cargarProductos();
  }

  async cargarUsuario() {
    this.storage.getItem('usuario').then(async (data: Usuario) => {
      if (data) {
        this.usuario = data;
        try {
          this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario?.id || 0);
        } catch (error) {
          console.log('Error al cargar la imagen de perfil:', error);
        }
      }
    }).catch(error => {
      console.log('Error al recuperar usuario: ', JSON.stringify(error));
    });
  }

  cargarProductos() {
    this.bd.fetchProductos().subscribe(productos => {
      this.productos = productos; 
      this.productosFiltrados = [...productos];
      console.log('Productos cargados: ', this.productos); 
    }, error => {
      console.error('Error al cargar productos', error);
    });
  }

  async filtrarProductos(event: any) {
    const searchValue = event.target.value;
    if (searchValue && searchValue.trim() !== '') {
      this.productosFiltrados = await this.bd.buscarProductosPorNombre(searchValue);
    } else {
      this.bd.cargarProductos(); 
    }
  }

  detalle(id: number){
    this.router.navigate(['/detalle', id]);
  }

  perfil(){
    this.router.navigate(['tabs/perfil'])
  }


}
