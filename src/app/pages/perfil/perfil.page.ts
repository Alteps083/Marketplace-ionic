import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';
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
        refresher.complete(); // Completa el refresco
      }
    }, 2000); // Simula una carga de 2 segundos
  }

  idLog: string = 'ProfilePage'
  constructor(private router:Router, private actionSheetControler: ActionSheetController) { }

  modperfil(){
    //crear logica de programación
    this.router.navigate(['/modperfil']);
  }
  modcontra(){
    //crear logica de programación
    this.router.navigate(['/modcontra']);
  }
  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const user = navigation.extras.state['user'];
      if (user) {
        this.usuario = user;
        console.log('Usuario recibido:', this.usuario);
    }
  }
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
