import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarproductoPageRoutingModule } from './editarproducto-routing.module';

import { EditarproductoPage } from './editarproducto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarproductoPageRoutingModule
  ],
  declarations: [EditarproductoPage]
})
export class EditarproductoPageModule {}
