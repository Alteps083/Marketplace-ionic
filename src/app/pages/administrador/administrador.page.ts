import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { AlertController } from '@ionic/angular';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';
import { Producto } from 'src/app/services/producto';  // Importa Producto
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';


@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.page.html',
  styleUrls: ['./administrador.page.scss'],
})
export class AdministradorPage {

  usuarioActual: Usuario | null = null;
  profileImage: string | null = null;
  usuario: Usuario | null = null;
  productos: Producto[] = [];
  reclamos: any[] = [];
  currentIndex = 0;
  tablaSeleccionada: string = '';
  usuarios: any[] = [];
  mostrarUsuarios: boolean = false; // Bandera para mostrar usuarios
  mostrarProductos: boolean = false; // Bandera para mostrar productos
  mostrarReclamos: boolean = false;

  searchText: string = '';  // Para la búsqueda
  mostrarBarraBusqueda: boolean = false;  // Controla si se muestra la barra de búsqueda

  usuariosFiltrados: Usuario[] = [];
  productosFiltrados: Producto[] = [];
  reclamosFiltrados: any[] = [];
  searchTerm: string = '';

  nuevaCategoria: string = '';
  categorias: any[] = [];
  mostrarCategorias: boolean = false;
  

  constructor(private router: Router, private bd: ServicebdService, private storage: NativeStorage, private alertController: AlertController, private sqlite: SQLite) {}

  ionViewWillEnter() {
    this.cargarUsuario();
    this.bd.cargarUsuarios();
    this.obtenerCategorias();
  }

  async ngOnInit() {
    this.cargarProductos();
    this.bd.productos$.subscribe(productos => {
      this.productos = productos;
    });
    this.cargarUsuario();
    this.bd.fetchUsuarios().subscribe((data: Usuario[]) => {
      this.usuarios = data;
      this.bd.cargarReclamos();
      
    });
    this.cargarDatos();
    this.bd.fetchUsuarios().subscribe(usuarios => {
      this.usuarios = usuarios;
    });
    this.usuariosFiltrados = this.usuarios;
    this.productosFiltrados = this.productos;
    this.reclamosFiltrados = this.reclamos;
    this.usuarioActual = this.bd.getUsuarioActual();
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const user = navigation.extras.state['user'];
      if (user) {
        this.usuario = user.usuario;
        console.log('Usuario recibido:', this.usuario);
        this.bd.listaReclamos$.subscribe(reclamos => {
          this.reclamos = reclamos;
        });
      }
    }

    const usuarioActual = this.bd.getUsuarioActual();
    if (usuarioActual && usuarioActual.nombre) {
      this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario?.id || 0);
    }
  }

  cargarUsuario() {
    
    this.storage.getItem('usuario').then((data: Usuario) => {
      if (data) {
        this.usuario = data;
        this.usuarios.forEach(usuario => {
          console.log('Usuario:', usuario);
        });
        

        this.bd.fetchUsuarios().subscribe((data) => {
          this.usuarios = data;
        });
        
      }
    }).catch(error => {
      console.log('Error al recuperar usuario: ', JSON.stringify(error));
    });
  }

  cargarProductos() {
    this.bd.obtenerProductos().then(productos => {
      this.productos = productos;
    }).catch(error => {
      console.error('Error al cargar productos:', error);
    });
  }

  cargarDatos() {
    this.bd.fetchUsuarios().subscribe((usuarios: Usuario[]) => {
      // Filtrar solo los usuarios normales
      this.usuarios = usuarios.filter(usuario => usuario.es_admin === false);
      this.usuariosFiltrados = this.usuarios; // Asegurarse de que usuariosFiltrados tenga los datos iniciales
    });
  
    this.bd.fetchProductos().subscribe((productos: Producto[]) => {
      this.productos = productos;
      this.productosFiltrados = productos; // Asegurarse de que productosFiltrados tenga los datos iniciales
    });
  
    this.bd.listarReclamos.subscribe(reclamos => {
      this.reclamos = reclamos;
      this.reclamosFiltrados = reclamos;  // Inicializa los filtrados
    });
  }
  


  eliminarusuario(id: number) {
    this.bd.eliminarusuario(id).then(() => this.cargarDatos());
  }
  
  editarUsuario(usuario: Usuario) {
    // Redirigir a la página de edición del usuario
    this.router.navigate(['/editarusuario'], { state: { usuario } });
  }

  eliminarProducto(id: number) {
    this.bd.eliminarProducto(id).then(() => this.cargarDatos());
  }

  editarProducto(producto: Producto) {
    this.router.navigate(['/editarproducto'], { state: { producto } });
  } 

  eliminarReclamo(id: number) {
    this.bd.eliminarReclamo(id).then(() => this.cargarDatos());
  }

  mostrarTabla(tabla: string) {
    this.tablaSeleccionada = tabla;
  }

  // Mostrar/Ocultar tablas
  mostrarTablaUsuarios() {
    this.mostrarCategorias = false;
    this.mostrarUsuarios = true;
    this.mostrarProductos = false;
    this.mostrarReclamos = false;
    this.usuariosFiltrados = this.usuarios.filter(usuario => usuario.es_admin === 0);
  }
  

  mostrarTablaProductos() {
    this.mostrarCategorias = false;
    this.mostrarUsuarios = false;
    this.mostrarProductos = true;
    this.mostrarReclamos = false;
    this.productosFiltrados = this.productos; // Reinicia la lista filtrada al mostrar la tabla
  }

  mostrarTablaReclamos() {
    this.mostrarCategorias = false;
    this.mostrarUsuarios = false;
    this.mostrarProductos = false;
    this.mostrarReclamos = true;
    this.reclamosFiltrados = this.reclamos; // Reinicia la lista filtrada al mostrar la tabla
  }

  mostrarTablaCategorias(){
    this.mostrarCategorias = true;
    this.mostrarUsuarios = false;
    this.mostrarProductos = false;
    this.mostrarReclamos = false;
    this.reclamosFiltrados = this.reclamos;
  }

  toggleSearchBar() {
    this.mostrarBarraBusqueda = !this.mostrarBarraBusqueda;
  }

  buscar() {
    const lowerSearchText = this.searchText.toLowerCase();

    if (this.mostrarUsuarios) {
      this.usuariosFiltrados = this.usuarios.filter(usuario =>
        usuario.nombre.toLowerCase().includes(lowerSearchText) ||
        usuario.email.toLowerCase().includes(lowerSearchText) ||
        usuario.telefono.toString().includes(lowerSearchText)
      );
    }

    if (this.mostrarProductos) {
      this.productosFiltrados = this.productos.filter(producto =>
        producto.nombre_producto.toLowerCase().includes(lowerSearchText) ||
        producto.descripcion.toLowerCase().includes(lowerSearchText) ||
        producto.precio.toString().includes(lowerSearchText)
      );
    }

    if (this.mostrarReclamos) {
      this.reclamosFiltrados = this.reclamos.filter(reclamo =>
        reclamo.email.toLowerCase().includes(lowerSearchText) ||
        reclamo.tipoProblema.toLowerCase().includes(lowerSearchText) ||
        reclamo.descripcion.toLowerCase().includes(lowerSearchText)
      );
    }
  }

  filtrarItems(event: any) {
    const searchTerm = event.target.value ? event.target.value.toLowerCase() : '';

    if (this.mostrarUsuarios) {
      this.usuariosFiltrados = this.usuarios.filter(usuario => 
        usuario.nombre.toLowerCase().includes(searchTerm) || 
        usuario.email.toLowerCase().includes(searchTerm));
    } else if (this.mostrarProductos) {
      this.productosFiltrados = this.productos.filter(producto => 
        producto.nombre_producto.toLowerCase().includes(searchTerm) || 
        producto.descripcion.toLowerCase().includes(searchTerm));
    } else if (this.mostrarReclamos) {
      this.reclamosFiltrados = this.reclamos.filter(reclamo => 
        reclamo.email.toLowerCase().includes(searchTerm) || 
        reclamo.tipoProblema.toLowerCase().includes(searchTerm));
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

  //ban
  async cargarUsuarios() {
    this.bd.mostrarUsuarios.subscribe(usuarios => {
      this.usuarios = usuarios;
    });
  }

  async banearUsuario(usuario: Usuario) {
    if (usuario.id !== undefined) { // Verificación para asegurar que id no sea undefined
      const nuevoEstado = usuario.estado === 1 ? 0 : 1;
      await this.bd.actualizarEstadoUsuario(usuario.id, nuevoEstado);
      usuario.estado = nuevoEstado;
    } else {
      console.error("El ID del usuario es indefinido.");
    }
  }
  
  // tabla categorias

  // Método para agregar una nueva categoría
  async agregarCategoria() {
    if (this.nuevaCategoria.trim()) {
      await this.bd.agregarCategoria(this.nuevaCategoria.trim());
      this.nuevaCategoria = ''; // Limpiar el campo de entrada
      this.obtenerCategorias(); // Actualizar la lista de categorías
    }
  }

  // Método para obtener todas las categorías
  async obtenerCategorias() {
    this.categorias = await this.bd.obtenerCategorias();
  }

  // Método para eliminar una categoría
  async eliminarCategoria(id: number) {
    await this.bd.eliminarCategoria(id);
    this.obtenerCategorias(); // Actualizar la lista después de eliminar
  }
}


