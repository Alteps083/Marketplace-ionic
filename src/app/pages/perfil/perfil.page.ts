import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { ActionSheetController } from '@ionic/angular';
import { ServicebdService } from 'src/app/services/servicebd.service';
import { Usuario } from 'src/app/services/usuario';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  listarUsuarios: Usuario[] = [];

  usuario: Usuario | null = null;

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); 
      }
    }, 2000); 
  }

  idLog: string = 'ProfilePage'
  constructor(private router:Router, private actionSheetControler: ActionSheetController, private storage: NativeStorage, private bd: ServicebdService) { }

  ngOnInit() {
    this.usuario = this.bd.getUsuarioActual();
  }
  

  modperfil(){
    this.router.navigate(['/modperfil']);
  }
  modcontra(){

    this.router.navigate(['/modcontra']);
  }

  async takePicture(){
  const actionSheet = await this.actionSheetControler.create({
    buttons: [
      {
        text: 'Camara',
        icon: 'camera',
        handler: () => {

        }
      },
      {
        text: 'Album',
        icon: 'images',
        handler: () => {

        }
      }
    ]
  })
await actionSheet.present()
}



}
