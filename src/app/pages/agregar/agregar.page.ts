import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Usuario } from 'src/app/services/usuario';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
})
export class AgregarPage implements OnInit {
  imagePreviews: string[] = [];
  imageBase64: string | undefined;
  usuarioActual: Usuario | null = null;

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

  constructor(private router: Router, private bd: ServicebdService) { }

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
  async onSubmit(form: NgForm) {
    if (form.valid) {
      const producto = form.value;
      const imagenes = this.imagePreviews;

      if (this.usuarioActual) { 
        const id_vendedor = this.usuarioActual.idusuario; 

        await this.bd.agregarProducto(
          id_vendedor,
          producto.titulo,
          producto.descripcion,
          producto.categoria,
          producto.estado,
          producto.precio,
          imagenes
        );
        this.router.navigate(['tabs/home']);
        console.log('Datos del producto: ', form.value);
        form.reset();
        this.imagePreviews = [];
      } else {
        console.log('No se pudo obtener el id del vendedor');
        this.router.navigate(['/login']); // Redirigir si no hay usuario
      }
    }
  }

  homead(){
    this.router.navigate(['/tabs/homeadmin']);
  }

  ngOnInit() {
    this.usuarioActual = this.bd.getUsuarioActual();
    if(!this.usuarioActual){
      console.log('No hay usuario actual');
      this.router.navigate(['/login']);
    }
  }

}
