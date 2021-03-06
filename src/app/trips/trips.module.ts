import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripsPage } from './trips.page';
import { IonicSelectableModule } from 'ionic-selectable';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: TripsPage }]),
    IonicSelectableModule
  ],
  declarations: [TripsPage]
})
export class TripsPageModule {}
