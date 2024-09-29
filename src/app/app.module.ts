import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AnimationController } from '@ionic/angular';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ImageModalComponent } from './components/image-modal/image-modal.component';
import { NativeStorage } from '@awesome-cordova-plugins/native-storage/ngx';

@NgModule({
  declarations: [AppComponent, ImageModalComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,ReactiveFormsModule,FormsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy, },AnimationController, NativeStorage],
  bootstrap: [AppComponent],
},

)
export class AppModule {}
