import { Component, ElementRef, ViewChild, OnInit, OnDestroy  } from '@angular/core';
import Swiper from 'swiper';
import { Router, NavigationExtras } from '@angular/router';
import { ServicebdService } from '../services/servicebd.service';
import { Producto } from '../services/producto';
import { AlertController, Platform } from '@ionic/angular';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { Usuario } from '../services/usuario';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  profileImage: string | null = null;

  productosRecientes: Producto[] = []; 
  productosPorCategoria: { [key: string]: Producto[] } = {}; 

  currentIndex = 0;
  intervalId: any;
  
  usuario: Usuario | null = null;

  productos: Producto[] = [];

  productosFiltrados: Producto[] = [];
  mostrarBarraBusqueda: boolean = false;
  searchTerm: string = '';

  idsUsuarios: number[] = [];

  images: string[] = [];

  
  constructor(private router:Router, private bd: ServicebdService, private platform: Platform, private alertController: AlertController, private storage: NativeStorage) {
    this.cargarUsuario();
 }


async ngOnInit() {
  await this.cargarUsuario();
  await this.obtenerUsuarioActual();
  const usuario = await this.obtenerUsuarioActual();
  if (this.usuario?.id !== undefined) {
    this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario.id);
  }
  this.usuario = this.bd.getUsuarioActual();

  if (this.usuario?.id) {
    try {
      this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario.id); // Cambiar a id
      console.log('Imagen de perfil cargada:', this.profileImage);
    } catch (error) {
      console.log('Error al obtener la imagen del usuario, manteniendo la imagen por defecto');
    }
  }
  this.actualizarRecientesYCategorias();
  this.bd.dbReady().subscribe(ready => {
    if (ready) {
      this.cargarProductos();
    }
  });
  this.actualizarRecientesYCategorias();
  this.autoSlide();

  this.bd.dbReady().subscribe(ready => {
    if (ready) {
      this.cargarProductos();
    }
  });

  const navigation = this.router.getCurrentNavigation();
  if (navigation?.extras.state) {
    const user = navigation.extras.state['user'];
    if (user) {
      this.usuario = user.usuario;
      console.log('Usuario recibido:', this.usuario);
      if (this.usuario && this.usuario.nombre) {
        try {
          const imagenUsuario = await this.bd.obtenerImagenUsuario(this.usuario?.id || 0); // Cambiar a ID si se espera un number
      if (imagenUsuario) {
            this.profileImage = imagenUsuario; // Actualiza la imagen si existe
            console.log('Imagen de perfil actualizada:', this.profileImage);
          }
        } catch (error) {
          console.log('Error al obtener la imagen del usuario recibido, manteniendo la imagen por defecto');
          // profileImage ya se inicializa con la imagen predeterminada
        }
      }
    }
  }

  this.actualizarRecientesYCategorias();
}

async obtenerUsuarioActual() {
  this.usuario = await this.bd.obtenerUsuarioPorId(1); 
  if (this.usuario && this.usuario.imagen) {
    this.profileImage = this.usuario.imagen;
  } else {
    this.profileImage = '/assets/img/nouser.png';
  }
}

async obtenerImagenUsuario(nombre: string): Promise<string> {
  try {
    console.log('Obteniendo imagen de usuario con nombre:', nombre);
    
    const imagen = await this.storage.getItem(`imagen_${nombre}`);
    
    if (imagen && imagen.startsWith('http')) {
      return imagen; 
    } else {
      return 'assets/img/nouser.png'; 
    }
  } catch (error) {
    console.log('Error al obtener la imagen del usuario:', error);
    return 'assets/img/nouser.png'; 
  }
}

  detalleProducto(productoId: number){
    console.log('Detalle del producto', productoId);
    this.router.navigate(['/detalle', productoId]);
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  autoSlide() {
    setInterval(() => {
      this.nextSlide();
    }, 6000); 
  }

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 2, 
    spaceBetween: 10 
  };


  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); 
      }
    }, 2000); 
  }

  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;

  async ionViewDidEnter() {
    this.images = await this.obtenerImagenes();
  }

  async obtenerImagenes(): Promise<string[]> {
    const imagenes = await this.bd.obtenerImagenes();
    return imagenes.map((imagen) => imagen.url);
  }

  //modificado
  cargarUsuario() {
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
    this.actualizarRecientesYCategorias();
    this.bd.fetchProductos().subscribe(productos => {
      this.productos = productos; 
      this.productosFiltrados = [...productos];
      console.log('Productos cargados: ', this.productos); 
    }, error => {
      console.error('Error al cargar productos', error);
    });
  }

  actualizarRecientesYCategorias() {
    this.bd.fetchProductos().subscribe(productos => {
      this.productos = productos;
      this.productosRecientes = this.productos.slice(-5).reverse();
      this.productosPorCategoria = {};
      this.productos.forEach(producto => {
        const categoria = producto.categoria || 'Otros';
        if (!this.productosPorCategoria[categoria]) {
          this.productosPorCategoria[categoria] = [];
        }
        this.productosPorCategoria[categoria].push(producto);
      });
      console.log('Productos recientes:', this.productosRecientes);
      console.log('Productos por categoría:', this.productosPorCategoria);
    }, error => {
      console.error('Error al cargar productos', error);
    });
  }

  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }

  goNext() {
    this.swiper?.slideNext();
  }

  goPrev() {
    this.swiper?.slidePrev();
  }

  swiperSlideChanged(e: any) {
    console.log('changed: ', e);
  }

  carrito(){
    this.router.navigate(['/carrito']);
  }

  detalle(id: number){
    this.router.navigate(['/detalle', id]);
  }

  isAdmin(): boolean {
    return this.usuario ? this.usuario.es_admin : false;
  }
  
  irAAdministrador() {
    console.log("Navegando a la página de administración");
    this.router.navigate(['/administrador']);  
  }

  admin(){
    this.bd.establecerAdmin('ale');
  }

  paginaBusqueda(){
    this.router.navigate(['/busqueda']);
  }

  perfil(){
    this.router.navigate(['tabs/perfil'])
  }

  toggleSearchBar() {
    this.mostrarBarraBusqueda = !this.mostrarBarraBusqueda;
  }

  filtrarProductos(event: any) {
    const valorBusqueda = event.target.value.toLowerCase();

    if (valorBusqueda && valorBusqueda.trim() !== '') {
      this.productosFiltrados = this.productos.filter(producto => 
        producto.nombre_producto.toLowerCase().includes(valorBusqueda)
      );
    } else {
      this.productosFiltrados = [...this.productos]; 
    }
  }

  mostrarIDsUsuarios() {
    this.bd.getUsuarios().then(usuarios => {
      this.idsUsuarios = usuarios.map(usuario => usuario.id);  
      console.log("IDs de los usuarios:", this.idsUsuarios);
    }).catch(error => {
      console.error("Error al obtener los usuarios:", error);
    });
  }
}
