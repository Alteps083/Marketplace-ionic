import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { AlertController } from '@ionic/angular';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';
import { Producto } from 'src/app/services/producto';  // Importa Producto

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

  constructor(private router: Router, private bd: ServicebdService, private storage: NativeStorage, private alertController: AlertController) {}

  ionViewWillEnter() {
    this.cargarUsuario();
    this.bd.cargarUsuarios();
  }

  async ngOnInit() {
    this.cargarUsuario();
    this.bd.fetchUsuarios().subscribe((data: Usuario[]) => {
      this.usuarios = data;
      this.bd.cargarReclamos();
      
    });
    this.cargarDatos();
    this.bd.fetchUsuarios().subscribe(usuarios => {
      this.usuarios = usuarios;
    });
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
      this.profileImage = await this.bd.obtenerImagenUsuario(usuarioActual.nombre);
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
    this.bd.fetchProductos().subscribe(productos => {
      this.productos = productos;
    });
  }

  cargarDatos() {
    this.bd.fetchUsuarios().subscribe(usuarios => this.usuarios = usuarios);  // Actualiza 'usuarios'
    this.bd.fetchProductos().subscribe(productos => this.productos = productos);
    this.bd.listarReclamos.subscribe(reclamos => this.reclamos = reclamos);
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
    this.mostrarUsuarios = true;
    this.mostrarProductos = false;
    this.mostrarReclamos = false;
  }

  mostrarTablaProductos() {
    this.mostrarUsuarios = false;
    this.mostrarProductos = true;
    this.mostrarReclamos = false;
  }

  mostrarTablaReclamos() {
    this.mostrarUsuarios = false;
    this.mostrarProductos = false;
    this.mostrarReclamos = true;
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

  
}


