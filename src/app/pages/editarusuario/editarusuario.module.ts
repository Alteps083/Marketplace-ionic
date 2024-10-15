import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarusuarioPageRoutingModule } from './editarusuario-routing.module';

import { EditarusuarioPage } from './editarusuario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarusuarioPageRoutingModule
  ],
  declarations: [EditarusuarioPage]
})
export class EditarusuarioPageModule {}
