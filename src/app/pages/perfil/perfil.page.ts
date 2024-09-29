import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  usuario: string = "";

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      const refresher = event.target as HTMLIonRefresherElement;
      if (refresher) {
        refresher.complete(); 
      }
    }, 2000); 
  }

  idLog: string = 'ProfilePage'
  constructor(private router:Router, private actionSheetControler: ActionSheetController, private storage: NativeStorage) { }

  ngOnInit() {
    this.cargarUsuario();
  }
  
  async cargarUsuario() {
    try {
      const data = await this.storage.getItem('user');
      if (data) {
        this.usuario = data.name; 
      } else {
        console.log('No se encontró un usuario guardado.');
      }
    } catch (error) {
      console.error('Error al recuperar los datos del usuario', error);
    }
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
