import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) { }

  async presentError(message) {
    const toast = await this.toastController.create({
      message: message,
      showCloseButton: true,
      position: 'bottom',
      color: 'danger',
      duration: 3000
    });
    toast.present();
  }

  async presentWarning(message) {
    const toast = await this.toastController.create({
      message: message,
      showCloseButton: true,
      position: 'bottom',
      color: 'warning',
      duration: 3000
    });
    toast.present();
  }

  async presentSuccess(message) {
    const toast = await this.toastController.create({
      message: message,
      showCloseButton: true,
      position: 'bottom',
      color: 'success',
      duration: 3000
    });
    toast.present();
  }
}
