import { Component, OnDestroy } from '@angular/core';
import { Trip } from '../_models/Trip';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { ShiftService } from '../_services/shift.service';
import { RouterPage } from '../_interfaces/RouterPage';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../_services/toast.service';
import { TripsService } from '../_services/trips.service';
import {formatDate } from '@angular/common';
import * as moment from 'moment';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { Events } from '@ionic/angular';
import { AppPreferences } from '@ionic-native/app-preferences/ngx';

@Component({
  selector: 'app-trips',
  templateUrl: 'trips.page.html',
  styleUrls: ['trips.page.scss']
})
export class TripsPage extends RouterPage implements OnDestroy {
  tripsDate = new Date;
  textTripsDate = moment(this.tripsDate).format("DD-MM-YYYY");
  formattedDate = ''
  trips: Trip[] = [];
  allTrips: Trip[] = [];
  startedDuty: Boolean = false;
  searchQuery: string = '';

  constructor(private alertCtrl: AlertController, private shiftService: ShiftService,
    private route: ActivatedRoute, router: Router, private toastService: ToastService,
    private tripsService: TripsService, private navController: NavController, private loadingController: LoadingController,
    private datePicker: DatePicker, private appPreferences: AppPreferences, public events: Events ) {
      
      super(router, route);
      this.events.subscribe("refreshed-trips", () => {
        this.refreshTrips();
      });
  }

  filterTrips(ev: any) {
    this.searchQuery = ev.target.value;
    this.trips = this.allTrips.filter((trip: Trip) => {
      return trip.Name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) > -1 ||
      ( trip.Location != undefined && trip.Location.toLowerCase().indexOf(this.searchQuery.toLowerCase()) > -1 ) ||
      ( trip.Service != undefined && trip.Service.toLowerCase().indexOf(this.searchQuery.toLowerCase()) > -1 ) ||
      ( trip.Telephone != undefined && trip.Telephone.toLowerCase().indexOf(this.searchQuery.toLowerCase()) > -1 ) ||
      ( trip.DoNum != undefined && trip.DoNum.toLowerCase().indexOf(this.searchQuery.toLowerCase()) > -1 ) ||
      ( trip.TallyCode != undefined && trip.TallyCode.toLowerCase().indexOf(this.searchQuery.toLowerCase()) > -1 );
    });
  }

  async payCash(TripId) {
    this.tripsService.getTotalAmount(TripId).subscribe(async (data: any) => {
      if(data['Success']) {
      const alert = await this.alertCtrl.create({
        header: 'Pay Cash',
        message: 'The total amount is: ' + data['amount'],
        
        inputs: [
          {
            name: 'collected_amount',
            placeholder: 'Collected Amount'
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
              this.tripsService.payCash(data.collected_amount, TripId).subscribe((result: any) => {
                if(result['Success']){
                  this.toastService.presentSuccess('Amount paid successfully');
                }
                else {
                  if (data['ErrorCode'] === '403') {
                    this.navController.navigateBack('/login');
                  } else {
                    this.toastService.presentError('Error in connection.');
                  }
                }

              }, (error) => {
                this.toastService.presentError('Error in connection.');
              });
            }
  
          }]
        });
        await alert.present();
      }
      else {
        if (data['ErrorCode'] === '403') {
          this.navController.navigateBack('/login');
        } else {
          this.toastService.presentError('Error in connection.');
        }
      }
    })
    
  }

  async refreshTrips() {
    this.trips = [];
    const loading = await this.loadingController.create({
      spinner: null,
      message: 'Loading trips.'
    });
    await loading.present();
    this.shiftService.CheckShift().subscribe((data: any) => {
      if (data['Success'] === true) {
        if (data['Status'] === false) {
          this.startedDuty = true;
        }
        else {
          this.startedDuty = false;
        }
        var apiFormattedDate = moment(this.tripsDate).format("YYYY-MM-DD");
      this.tripsService.getTrips(apiFormattedDate).subscribe((data: any) => {
        if (data['Success']) {
          this.allTrips = data['Trips'] as Array<Trip>;
          this.allTrips.forEach(trip => {
            if( trip.PunchInText === undefined){
              trip.PunchInText = 'Punch In';
            }
          });
          this.trips = this.allTrips;
        } else {
          if (data['ErrorCode'] === '403') {
            this.navController.navigateBack('/login');
          } else {
            this.toastService.presentError('Error while getting trips from server.');
          }
        }
        loading.dismiss();
      }, (Error) => {
        this.toastService.presentError('Please check your internet connection.');
        loading.dismiss();
      });
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
      loading.dismiss();
    });
  }

  onEnter() {
    
  }

  async ionViewWillEnter() {
    this.tripsDate = new Date();
    this.appPreferences.fetch('Trips', 'TripsFilterDate').then(date => {
      if (date != null)
        this.tripsDate = new Date(date)
    }).finally(() => {
      this.formattedDate = moment(this.tripsDate).format("YYYY-MM-DD");
      this.textTripsDate = moment(this.tripsDate).format("DD-MM-YYYY")
      this.refreshTrips()
    })
    
  }

  openDatePicker() {
    this.datePicker.show({
      date: this.tripsDate,
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      date => {
        this.tripsDate = date;
        this.appPreferences.store('Trips', 'TripsFilterDate', date)
        this.textTripsDate = moment(this.tripsDate).format("DD-MM-YYYY")
        this.refreshTrips()
      },
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  onDestroy() {
    super.ngOnDestroy();
  }

  async PunchIn(Trip: Trip) {
    let Id = Trip.Id;
    const alert = await this.alertCtrl.create({
      header: 'Confirm punch in',
      message: 'Are you sure you want to punch in?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Yes',
          handler: () => {
            this.tripsService.punchIn(Id).subscribe((data: any) => {
              if (data['Success']) {
                let now = new Date();
                // Trip.PunchIn = now;
                // Trip.PunchInText = 'Punch In - ' + formatDate(now, 'hh:mm', 'en-US');
                //this.PunchInText = 'Punch In - ' + formatDate(now, 'hh:mm', 'en-US');
                if(data['UnsignedSkips']) {
                  this.toastService.presentWarning('This Client has some unsigned trips, please sign them.');
                }
                
                this.navController.navigateForward('/punch-out/' + Id)
              } else {
                if (data['ErrorCode'] === '403') {
                  this.navController.navigateRoot('/login');
                } else {
                  this.toastService.presentError('Server Error.');
                }
              }
            }, (Error) => {
              this.toastService.presentError('Please check your internet connection.');
            });
          }
        }
    ]
    });
    await alert.present();
  }
}
