import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { AlertController } from '@ionic/angular';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';
import { Producto } from 'src/app/services/producto';  // Importa Producto
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Camera, CameraResultType, CameraSource, Photo  } from '@capacitor/camera';

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

  imagenCarrusel: string | null = null;
  imagenesCarrusel: any[] = [];
  nuevaImagenUrl: string = '';
  mostrarCarrusel: boolean = false;
  database!: SQLiteObject;

  isBanModalOpen = false;
  razonBan: string = '';
  duracionBan: number = 0;
  usuarioSeleccionado: any = null;

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); 
      }
    }, 2000); 
  }

  constructor(private router: Router, private bd: ServicebdService, private storage: NativeStorage, private alertController: AlertController, private sqlite: SQLite) {}

  ionViewWillEnter() {
    this.cargarUsuario();
    this.bd.cargarUsuarios();
    this.obtenerCategorias();
    this.obtenerImagenes();

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
    this.mostrarCarrusel=false;
    this.mostrarCategorias = false;
    this.mostrarUsuarios = true;
    this.mostrarProductos = false;
    this.mostrarReclamos = false;
    this.usuariosFiltrados = this.usuarios.filter(usuario => usuario.es_admin === 0);
  }
  

  mostrarTablaProductos() {
    this.mostrarCarrusel=false;
    this.mostrarCategorias = false;
    this.mostrarUsuarios = false;
    this.mostrarProductos = true;
    this.mostrarReclamos = false;
    this.productosFiltrados = this.productos; // Reinicia la lista filtrada al mostrar la tabla
  }

  mostrarTablaReclamos() {
    this.mostrarCarrusel=false;
    this.mostrarCategorias = false;
    this.mostrarUsuarios = false;
    this.mostrarProductos = false;
    this.mostrarReclamos = true;
    this.reclamosFiltrados = this.reclamos; // Reinicia la lista filtrada al mostrar la tabla
  }

  mostrarTablaCategorias(){
    this.mostrarCarrusel=false;
    this.mostrarCategorias = true;
    this.mostrarUsuarios = false;
    this.mostrarProductos = false;
    this.mostrarReclamos = false;
    this.reclamosFiltrados = this.reclamos;
  }

  mostrartablaCarrusel() {
    this.mostrarCarrusel = true;
    this.mostrarCategorias = false;
    this.mostrarUsuarios = false;
    this.mostrarProductos = false;
    this.mostrarReclamos = false;
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

  //imagenes carrusel

  async obtenerImagenes() {
    this.imagenesCarrusel = await this.bd.obtenerImagenes();
  }

  // Agregar una nueva imagen al carrusel si se proporciona una URL
  async agregarImagen() {
    if (this.nuevaImagenUrl.trim()) {
      await this.bd.agregarImagen(this.nuevaImagenUrl.trim());
      this.nuevaImagenUrl = ''; // Limpiar el campo de entrada
      this.obtenerImagenes(); // Actualizar la lista de imágenes
    }
  }

  // Eliminar una imagen del carrusel por su ID
  async eliminarImagen(id: number) {
    await this.bd.eliminarImagen(id);
    this.obtenerImagenes(); // Actualizar la lista después de eliminar
  }

  // Seleccionar una imagen de la galería y almacenarla temporalmente
  async selectFromGallery() {
    const image = await Camera.getPhoto({
       quality: 90,
       allowEditing: false,
       resultType: CameraResultType.Uri,
       source: CameraSource.Photos
    });
 
    // Convertir la imagen a base64 para mostrar en vista previa y guardar en la base de datos
    this.imagenCarrusel = await this.readAsBase64(image);
  }

  // Convertir una foto a base64
  async readAsBase64(photo: Photo): Promise<string> {
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
    return await this.convertBlobToBase64(blob) as string;
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
       resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  // Guardar la imagen en el carrusel cuando se presiona el botón
  async guardarImagenCarrusel() {
    if (this.imagenCarrusel) {
      try {
        await this.insertarImagen(this.imagenCarrusel);
        this.imagenCarrusel = null; // Limpiar la imagen después de guardarla
        this.obtenerImagenes(); // Refrescar la lista de imágenes en el carrusel
        this.presentAlert('Éxito', 'Imagen guardada en el carrusel correctamente.');
      } catch (error) {
        console.error('Error al guardar la imagen en el carrusel:', error);
        this.presentAlert('Error', 'Hubo un problema al guardar la imagen.');
      }
    } else {
      this.presentAlert('Advertencia', 'No hay una imagen seleccionada para guardar.');
    }
  }

  async insertarImagen(imagenBase64: string) {
    const db = await this.getDatabase();
    const query = `INSERT INTO imagenes_carrusel (url) VALUES (?)`;
    db.executeSql(query, [imagenBase64]).then(() => {
      console.log('Imagen insertada correctamente');
    }).catch(error => {
      console.error('Error al insertar la imagen', error);
    });
  }

  async getDatabase() {
    if (!this.database) {
      this.database = await this.sqlite.create({
        name: 'mi_basedatos.db',
        location: 'default'
      });
    }
    return this.database;
  }

  irAVerPublicacion(id: number) {
    this.router.navigate(['/detalle', id]);
  }

  abrirModalBanear(usuario: any) {
    this.usuarioSeleccionado = usuario;
    this.isBanModalOpen = true;
  }

  async confirmarBaneo() {
    if (this.usuarioSeleccionado && this.razonBan.trim() && this.duracionBan > 0) {
      await this.bd.confirmarBaneo(this.usuarioSeleccionado, this.razonBan, this.duracionBan);
      await this.cargarUsuarios();
      this.cerrarModal();
    } else {
      this.presentAlert('Error', 'Por favor complete todos los campos correctamente.');
    }
  }

  cerrarModal() {
    this.isBanModalOpen = false;
  }




}


