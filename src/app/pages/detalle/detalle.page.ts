import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ImageModalComponent } from '../../components/image-modal/image-modal.component'; // Ajusta la ruta según tu estructura de carpetas

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {

  constructor(private router:Router, private modelController: ModalController) { }

  async presentImageModal(imageSrc: string) {
    const modal = await this.modelController.create({
      component: ImageModalComponent,
      componentProps: {
        imageSrc: imageSrc,
      },
    });
    return await modal.present();
  }

  ngOnInit() {
  }
  
  perfil() {
    this.router.navigate(['/tabs/perfil']);
  }

  vendedor(){
    this.router.navigate(['/tabs/chat'])
  }
}
