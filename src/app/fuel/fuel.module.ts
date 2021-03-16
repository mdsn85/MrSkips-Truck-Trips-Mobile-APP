import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FuelPage } from './fuel.page';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: FuelPage }]),
    IonicSelectableModule
  ],
  declarations: [FuelPage]
})
export class FuelPageModule {}
