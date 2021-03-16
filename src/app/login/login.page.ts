import { AppPreferences } from '@ionic-native/app-preferences/ngx';
import { Component } from '@angular/core';

import { AuthService } from '../_services/auth.service';
import { Router, NavigationExtras } from '@angular/router';
import { User } from '../_models/User';
import { ToastService } from '../_services/toast.service';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  username: any;
  password: any;
  constructor(private authService: AuthService, private appPreferences: AppPreferences, private router: Router,
    private toastService: ToastService, private storage: Storage, private navController: NavController
    ) { }

  async signIn() {
      await this.authService.login(this.username, this.password).subscribe((data: any) => {
        if (data['Success'] === true) {
          this.appPreferences.store('USER', JSON.stringify(data['User'] as User));
          this.appPreferences.store('Trips', 'TripsFilterDate', new Date())
          let token = data['Token']
          console.log(data);
          console.log(token);
          this.appPreferences.store('token', data['Token']).then(() => {
            this.navController.navigateRoot(['/tabs/tab4']);
          })
        } else {
          if (data['ErrorCode'] === '403') {
            this.toastService.presentError('Not Autherized');
          } else {
            this.toastService.presentError('Server Error');
          }
        }
      }, (Error) => {
        this.toastService.presentError('Server Error');
      });
  }

}
