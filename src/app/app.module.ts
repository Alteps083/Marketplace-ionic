import { importProvidersFrom, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PushNotifications } from '@capacitor/push-notifications';
import { RouteReuseStrategy } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AnimationController } from '@ionic/angular';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire/compat';
import { getMessaging, onMessage } from 'firebase/messaging';
import { initializeApp } from "firebase/app";
import { ImageModalComponent } from './components/image-modal/image-modal.component';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { ServicebdService } from './services/servicebd.service';
import { PantallaCargaComponent } from './components/pantalla-carga/pantalla-carga.component';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RatingService } from './services/rating.service';
@NgModule({
  declarations: [AppComponent, ImageModalComponent, PantallaCargaComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig,
    )
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AnimationController, 
    NativeStorage, 
    provideFirestore(() => getFirestore()),
    SQLite,
    ServicebdService,
    RatingService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(){
  }

}
