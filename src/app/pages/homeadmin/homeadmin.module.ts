import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomeadminPageRoutingModule } from './homeadmin-routing.module';

import { HomeadminPage } from './homeadmin.page';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomeadminPageRoutingModule, 
  ],
  declarations: [HomeadminPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class HomeadminPageModule {}

