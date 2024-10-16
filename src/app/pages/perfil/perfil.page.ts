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

  profileImage: string | null = null;

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

  async ngOnInit() {
    this.cargarUsuario();

    this.usuario = this.bd.getUsuarioActual();
    const usuarioActual = this.bd.getUsuarioActual();
    if (usuarioActual && usuarioActual.nombre) {
      this.profileImage = await this.bd.obtenerImagenUsuario(usuarioActual.nombre);
    }
  }

  cargarUsuario() {
    this.storage.getItem('usuario').then(async (data: Usuario) => {
      if (data) {
        this.usuario = data;
        try {
          this.profileImage = await this.bd.obtenerImagenUsuario(this.usuario.nombre);
        } catch (error) {
          console.log('Error al cargar la imagen de perfil:', error);
        }
      }
    }).catch(error => {
      console.log('Error al recuperar usuario: ', JSON.stringify(error));
    });
  }

  cerrarSesion(){
    this.storage.remove('usuario').then(() => {
      this.router.navigate(['/login']);
    })
  }
  

  modperfil(){
    this.router.navigate(['/modperfil']);
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
