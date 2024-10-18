import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Producto } from 'src/app/services/producto';
import { ServicebdService } from 'src/app/services/servicebd.service';

@Component({
  selector: 'app-editarproducto',
  templateUrl: './editarproducto.page.html',
  styleUrls: ['./editarproducto.page.scss'],
})
export class EditarproductoPage implements OnInit {

  producto: Producto = {
    id: 0,
    id_vendedor: 0,
    nombre_producto: '',
    descripcion: '',
    categoria: '',
    estado: '',
    precio: 0,
    imagenes: []
  };

  constructor(private router: Router, private bd: ServicebdService) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const receivedProduct = navigation.extras.state['producto'];
      if (receivedProduct) {
        this.producto = { ...receivedProduct };
        console.log('Producto recibido para editar:', this.producto);
      } else {
        console.error('No se encontró el producto en el estado de navegación');
        this.router.navigate(['/administrador']);
      }
    } else {
      console.error('No se recibió información del producto');
      this.router.navigate(['/administrador']);
    }
  }

  guardarCambios() {
    if (this.producto.id) {
      this.bd.actualizarProducto(this.producto).then(() => {
        console.log('Producto actualizado correctamente');
        this.router.navigate(['/administrador']).then(() => {
          // Aquí puedes llamar a cargarProductos si es necesario
          this.bd.cargarProductos(); // Solo si estás usando el mismo servicio
        });
      }).catch(error => {
        console.error('Error al actualizar el producto:', error);
      });
    } else {
      console.error('ID del producto no válido');
    }
  }
  
}
