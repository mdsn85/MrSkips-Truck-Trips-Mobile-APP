import { Component, OnDestroy } from '@angular/core';
import { User } from '../_models/User';
import { AuthService } from '../_services/auth.service';
import { AppPreferences } from '@ionic-native/app-preferences/ngx';
import { NavController, AlertController } from '@ionic/angular';
import { ShiftService } from '../_services/shift.service';
import { ToastService } from '../_services/toast.service';
import { RouterPage } from '../_interfaces/RouterPage';
import { ActivatedRoute, Router } from '@angular/router';
import { TripsService } from '../_services/trips.service';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page extends RouterPage implements OnDestroy {
  user: User = {
    Id: 0,
    Helpers: [],
    Name: '',
    Vehicle: {
      Id: 0,
      Name: ''
    },
    StartKM: 0
  };
  startedDuty: Boolean;
  dump: Boolean;
  dumpLocation: any;
  dumpLocations: Array<any>;

  constructor(private appPreferences: AppPreferences, private navController: NavController,
    private toastService: ToastService, private shiftService: ShiftService,
    private alertController: AlertController, private route: ActivatedRoute, private router: Router,
    private tripsService: TripsService ) {
      super(router, route);
    }
    
  ionViewWillEnter() {
    this.dump = false;
    this.shiftService.RefreshUser().subscribe((data: any) => {
      if (data['Success'] === true) {
        this.appPreferences.store('USER', JSON.stringify(data['User'] as User));
        this.user = data['User'] as User;
        //this.toastService.presentSuccess('Trip information updated successfully');
      } else {
        if (data['ErrorCode'] === '403') {
          this.navController.navigateRoot('/login');
          this.toastService.presentError('Not Autherized');
        } else {
          this.toastService.presentError(data['message']);
        }
      }
    }, (Error) => {
      this.toastService.presentError('Server Error');
    });
    this.shiftService.CheckShift().subscribe((data: any) => {
      if (data['Success'] === true) {
        if (data['Status'] === false) {
          this.startedDuty = true;
        }
        else {
          this.startedDuty = false;
        }
        //this.toastService.presentSuccess('Trip information updated successfully');
      } else {
        if (data['ErrorCode'] === '403') {
          this.navController.navigateRoot('/login');
          this.toastService.presentError('Not Autherized');
        } else {
          this.toastService.presentError(data['message']);
        }
      }
    }, (Error) => {
      this.toastService.presentError('Server Error');
    });
    this.shiftService.GetDumbLocations().subscribe((data) => {
      if ( data['Success']) {
        this.dumpLocations = data['DumbLocation'];
      } else {
        if (data['ErrorCode'] === '403') {
          this.navController.navigateBack('login');
        } else {
          this.toastService.presentError(data['Message']);
        }
      }
    }, (error) => {
      this.toastService.presentError('Please check your internet connection.');
    });
  }
  onEnter() {
    
  }

  onDestroy() {
    super.ngOnDestroy();
  }

  async StartDuty() {
    const alert = await this.alertController.create({
      header: 'Confirm Start Duty',
      message: 'Are you sure to start your duty?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Confirm',
          handler: () => {
              this.navController.navigateRoot('/checklist');
          }

        }]
      });
      await alert.present();
  }

  logout() {
    this.appPreferences.remove("USER");
    this.navController.navigateRoot('/login');
  }

  async StopDuty() {
    const tripsNotDumped = 0;
    if (tripsNotDumped > 0 ) {
      this.toastService.presentError('Some waste not dumped or put in yard.');
      return;
    }
    const alert = await this.alertController.create({
      header: 'Confirm purchase',
      message: 'Are you sure to stop your duty?',
      
      inputs: [
        {
          name: 'endKM',
          placeholder: 'End KM'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Confirm',
          handler: data => {
            this.shiftService.StopShift(data.endKM).subscribe((result: any) => {
              if (result['Success']) {
                this.startedDuty = false;
                this.appPreferences.store('DUTY', 'false').then(() => {
                  this.startedDuty = false;
                }, (error) => {
                  this.toastService.presentError('Error while trying to stop duty.');
                });
              } else {
                if (result['ErrorCode'] === '403') {
                  this.navController.navigateBack('login');
                } else {
                  this.toastService.presentError(result['Message']);
                }
              }
            }, (error) => {
              this.toastService.presentError('Please check your internet connection.');
            });
          }

        }]
      });
      await alert.present();
  }

  async Dump() {
    if (this.dumpLocation === undefined) {
      this.toastService.presentError('Please Select dump location before proceeding.');
      return;
    }
    const alert = await this.alertController.create({
      header: 'Confirm Dumping',
      message: 'Are you sure you want to dump your waste?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: () => {
            this.tripsService.dumb(this.dumpLocation.Id).subscribe((result) => {
              if (result['Success']) {
                this.toastService.presentSuccess('Wastes Dumped successfully!');
              }
              else{
                if (result['ErrorCode'] === '403') {
                  this.navController.navigateBack('login');
                } else {
                  this.toastService.presentError(result['Message']);
                }
              }
            }, (error) => {
              this.toastService.presentError('Please check your internet connection.');
            });
          }

        }]
      });
      await alert.present();
  }

  async Yard() {
    const alert = await this.alertController.create({
      header: 'Confirm Yard',
      message: 'Are you sure you want to put your waste in yard?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: () => {
            this.toastService.presentSuccess('Wastes yarded successfully.');
            /*this.shiftService.StopShift().subscribe((result: Boolean) => {
              if (result) {
                this.appPreferences.remove('DUTY').then(() => {
                }, (error) => {
                  this.toastController.create({
                    color: 'danger',
                    duration: 1000,
                    message: 'Error while trying to stop your duty.'
                  });
                });
              }
            }, (error) => {
              this.toastController.create({
                color: 'danger',
                duration: 1000,
                message: 'Please check your internet connection.'
              });
            });*/
          }

        }]
      });
      await alert.present();
  }

  refreshUser() {
    this.shiftService.RefreshUser().subscribe((data: any) => {
      if (data['Success'] === true) {
        this.appPreferences.store('USER', JSON.stringify(data['User'] as User));
        this.user = data['User'] as User;
        this.toastService.presentSuccess('Trip information updated successfully');
      } else {
        if (data['ErrorCode'] === '403') {
          this.navController.navigateRoot('/login');
          this.toastService.presentError('Not Autherized');
        } else {
          this.toastService.presentError(data['message']);
        }
      }
    }, (Error) => {
      this.toastService.presentError('Server Error');
    });
  }
}
