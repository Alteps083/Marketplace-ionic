import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Usuario } from 'src/app/services/usuario';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { NotificationsPushService } from 'src/app/services/notifications-push.service';
import { Notificacion } from 'src/app/services/notificacion';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
})
export class AgregarPage implements OnInit {
  imagePreviews: string[] = [];
  miFormulario: FormGroup;
  marginBottom: string = '200px';
  profileImage: string | null = null;
  usuario: Usuario | null = null;
  categorias: any[] = [];

  constructor(
    private router: Router, 
    private bd: ServicebdService, 
    private storage: NativeStorage, 
    private fb: FormBuilder, 
    private notificationService: NotificationsPushService
  ) {
    this.miFormulario = this.fb.group({
      titulo: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
      estado: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(50)]],
    });
  }

  onDescriptionChange(event: any) {
    const input = event.target.value;
    this.miFormulario.controls['descripcion'].setValue(input);
  }

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); 
      }})}

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

  async onSubmit() {
    if (this.miFormulario.valid) {
      const producto = this.miFormulario.value; 
      const imagenes = this.imagePreviews;

      if (this.usuario) {
        const id_vendedor = this.usuario.id; 

        await this.bd.agregarProducto(
          id_vendedor,
          producto.titulo,
          producto.descripcion,
          producto.categoria,
          producto.estado,
          producto.precio,
          imagenes
        );

        const notificacion: Notificacion = {
          imagen: this.usuario.imagen, 
          nombreUsuario: this.usuario.nombre, 
          nombreProducto: producto.titulo,
          fecha: new Date().toISOString()  // Añade la fecha actual
        };

        await this.notificationService.addNotification(notificacion);
        this.router.navigate(['tabs/home']);
        console.log('Datos del producto: ', producto);
        this.imagePreviews = [];
      } else {
        console.log('No se pudo obtener el id del vendedor');
        this.router.navigate(['/login']); 
      }
    }
  }

  async ngOnInit() {

    await this.cargarCategorias(); // Cargar las categorías desde la base de datos
    await this.cargarUsuario();

    if (this.descripcion) {
      this.descripcion.markAsTouched();
    }
    
    await this.cargarUsuario(); 
    this.usuario = this.bd.getUsuarioActual();
    if (this.usuario) {
      this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario?.id || 0);
    }

    Keyboard.addListener('keyboardWillShow', (info) => {
      this.marginBottom = `${info.keyboardHeight}px`;
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.marginBottom = '0px';
    });
  }

  async cargarCategorias() {
    this.categorias = await this.bd.obtenerCategorias();
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    if (image && image.base64String) {
      this.imagePreviews.push(`data:image/jpeg;base64,${image.base64String}`);
    }
  }

  async selectFromGallery() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    });

    if (image && image.base64String) {
      this.imagePreviews.push(`data:image/jpeg;base64,${image.base64String}`);
    }
  }

  get descripcion() {
    return this.miFormulario.get('descripcion');
  }
  
  perfil() {
    this.router.navigate(['tabs/perfil']);
  }

  homead() {
    this.router.navigate(['/tabs/homeadmin']);
  }
}
