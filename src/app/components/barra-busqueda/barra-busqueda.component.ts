import { Component, OnInit } from '@angular/core';
import { Producto } from 'src/app/services/producto';
import { ServicebdService } from 'src/app/services/servicebd.service';

@Component({
  selector: 'app-barra-busqueda',
  templateUrl: './barra-busqueda.component.html',
  styleUrls: ['./barra-busqueda.component.scss'],
})
export class BarraBusquedaComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  searchTerm: string = '';

  constructor(private servicebd: ServicebdService) {}

  ngOnInit() {
    this.cargarProductos(); // Cargar todos los productos al iniciar
  }

  async cargarProductos() {
    this.productosFiltrados = this.productos; // Inicialmente, mostrar todos los productos
  }

  onSearchChange(searchValue: string) {
    this.searchTerm = searchValue;
    this.buscarProductos();
  }

  async buscarProductos() {
    if (this.searchTerm.trim() !== '') {
      this.productosFiltrados = await this.servicebd.buscarProductosPorNombre(this.searchTerm);
    } else {
      this.productosFiltrados = this.productos; // Restablecer a todos los productos si no hay término de búsqueda
    }
  }
}