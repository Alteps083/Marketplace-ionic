import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-pantalla-carga',
  templateUrl: './pantalla-carga.component.html',
  styleUrls: ['./pantalla-carga.component.scss'],
})
export class PantallaCargaComponent  implements OnInit {
  progress = 0;
  constructor(private cargaPantalla: LoadingController) { }

  async ngOnInit() {
    this.pantallaDeCarga();
  }

  pantallaDeCarga(){
    const interval = setInterval(() => {
      this.progress += 10;
      if (this.progress >= 100){
        clearInterval(interval)
      }
    }, 300)
  }
};

  


