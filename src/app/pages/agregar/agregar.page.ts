import { Component, OnInit } from '@angular/core';
import { Form, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
  imageBase64: string | undefined;
  usuario: Usuario | null = null;
  miFormulario: FormGroup;
  marginBottom: string = '200px';
  profileImage: string | null = null;

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); 
      }
    }, 2000); 
  }

  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput.click();
  }

  constructor(private router: Router, private bd: ServicebdService, private storage: NativeStorage, private fb: FormBuilder, private notificationService:NotificationsPushService) { 
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

  async takePicture(){
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing:false,
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

  async cargarUsuario() {
    try {
      const data = await this.storage.getItem('usuario');
      if (data) {
        this.usuario = data as Usuario;
        this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario.nombre);
      } else {
        console.log('No se encontró un usuario en el almacenamiento');
        this.router.navigate(['/login']); 
      }
    } catch (error) {
      console.log('Error al recuperar usuario: ', JSON.stringify(error));
      this.router.navigate(['/login']); 
    }
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
          nombreProducto: producto.titulo
        };

        this.notificationService.addNotification(notificacion);
        this.router.navigate(['tabs/home']);
        console.log('Datos del producto: ', producto);
        this.miFormulario.reset(); 
        this.imagePreviews = [];
      } else {
        console.log('No se pudo obtener el id del vendedor');
        this.router.navigate(['/login']); 
      }
    }
  }

  homead(){
    this.router.navigate(['/tabs/homeadmin']);
  }

  async ngOnInit() {
    await this.cargarUsuario();
    this.usuario = this.bd.getUsuarioActual();
    if(!this.usuario){
      console.log('No hay usuario actual');
      this.router.navigate(['/login']);
    }
    const usuarioActual = this.bd.getUsuarioActual();
    if (usuarioActual && usuarioActual.nombre) {
      this.profileImage = await this.bd.obtenerImagenUsuario(usuarioActual.nombre);
    }

    Keyboard.addListener('keyboardWillShow', (info) => {
      this.marginBottom = `${info.keyboardHeight}px`; 
    });

    Keyboard.addListener('keyboardWillHide', () => {
      this.marginBottom = '0px'; 
    });
  }

  get descripcion(){
    return this.miFormulario.get('descripcion');
  }

}
