import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PushNotifications } from '@capacitor/push-notifications';
import { RouteReuseStrategy } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AnimationController } from '@ionic/angular';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ImageModalComponent } from './components/image-modal/image-modal.component';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { ServicebdService } from './services/servicebd.service';
import { PantallaCargaComponent } from './components/pantalla-carga/pantalla-carga.component';



import { environment } from 'src/environments/environment';



@NgModule({
  declarations: [AppComponent, ImageModalComponent, PantallaCargaComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AnimationController, 
    NativeStorage, 
    SQLite,
    ServicebdService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
