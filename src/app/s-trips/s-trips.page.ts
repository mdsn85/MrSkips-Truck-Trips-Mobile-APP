import { Component, OnInit, OnDestroy } from '@angular/core';
import { formatDate } from '@angular/common';
import { Trip } from '../_models/Trip';
import { RouterPage } from '../_interfaces/RouterPage';
import { AlertController, NavController, LoadingController } from '@ionic/angular';
import { ToastService } from '../_services/toast.service';
import { ShiftService } from '../_services/shift.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TripsService } from '../_services/trips.service';

@Component({
  selector: 'app-s-trips',
  templateUrl: './s-trips.page.html',
  styleUrls: ['./s-trips.page.scss'],
})
export class STripsPage extends RouterPage implements OnDestroy {

  trips: Trip[] = [];
  allTrips: Trip[] = [];
  startedDuty: Boolean = false;
  punchinColor: string = 'primary';
  searchQuery: string = '';
  PunchInText: string = 'Punch In';
  startDate: Date;
  endDate: Date;

  constructor(private alertCtrl: AlertController, private shiftService: ShiftService,
    private route: ActivatedRoute, router: Router, private toastService: ToastService,
    private tripsService: TripsService, private navController: NavController, private loadingController: LoadingController ) {
    super(router, route);
  }

  filterTrips(ev: any) {
    this.searchQuery = ev.target.value;
    this.trips = this.allTrips.filter((trip: Trip) => {
      return trip.Name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) > -1;
    });

    console.log("filterTrips - this.startDate ="+this.startDate +" end"+this.endDate )

    if(this.startDate !== undefined && this.endDate !== undefined){
      this.trips = this.trips.filter((trip: Trip) => {
          return trip.Date >= this.startDate && trip.Date <= this.endDate;
      });
      console.log("this.trips -"+this.trips.length)
    }



    if(this.startDate !== undefined && this.endDate === undefined){
      let selecteddate = this.ConvertStringToDate(this.startDate);
      selecteddate.setDate(selecteddate.getDate()+1);
      var x: any = this.formatDate(selecteddate);
      var y:Date=x;
      
      this.trips = this.trips.filter((trip: Trip) => {
          return trip.Date >= this.startDate && trip.Date <= y;
      });
    }

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
        this.tripsService.getUnsignedTrips().subscribe((data: any) => {
          if (data['Success']) {
            this.allTrips = data['Trips'] as Array<Trip>;
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
        
        loading.dismiss();
      }
    }, (Error) => {
      this.toastService.presentError('Server Error');
    });
  }

  async onEnter() {
    this.startDate=undefined;
    this.endDate=undefined;
    this.refreshTrips()
  }

  onDestroy() {
    super.ngOnDestroy();
  }

  async PunchId(Id) {
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
                this.punchinColor = 'warning';
                let now = new Date();
                this.PunchInText = 'Punch In - ' + formatDate(now, 'hh:mm', 'en-US');
                if(data['UnsignedSkips']) {
                  this.toastService.presentWarning('This Client has some unsigned trips, please sign them.');
                }
              } else {
                if (data['ErrorCode'] === '403') {
                  this.navController.navigateBack('/login');
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

 ConvertStringToDate(st){
      let year = st.substring(0, 4);
      let month = st.substring(5, 7);
      let day = st.substring(8, 10);
      console.log(year +","+month+","+day);
      var dd =  new Date(year , parseInt(month)-1, day);
  
      return dd;
  }

  formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
  } 

  filterStartDateTrips(ev: any) {

    //this.startDate = ev.target.value;//2021-02-25
   
    let selecteddate = this.ConvertStringToDate(this.startDate);
    //selecteddate = this.formatDate(selecteddate);
    console.log(" Selected Start date :"+this.startDate);
    console.log(" Selected selecteddate :"+selecteddate);

    if(this.endDate !== undefined){
      var y:Date=this.endDate;
     }else
     {
       selecteddate.setDate(selecteddate.getDate()+1);
       var x: any = this.formatDate(selecteddate);
       var y:Date=x;
     }

    this.trips = this.allTrips.filter( (trip: Trip) => {
      return trip.Date >= this.startDate && trip.Date <= y;     
    });
  }
//RKP
  async filterEndDateTrips(ev: any) {
    //this.endDate = ev.target.value;
    let selecteddate = this.ConvertStringToDate(this.endDate);

    selecteddate.setDate(selecteddate.getDate()+1);
    let x: any = this.formatDate(selecteddate);
    let y:Date=x;

    if(this.startDate != undefined){
      this.trips = this.allTrips.filter((trip: Trip) => {
          return trip.Date >= this.startDate && trip.Date <= y;
      });
    }
  }

  async Sign(Trip:Trip){

    let Id = Trip.Id;
    const alert = await this.alertCtrl.create({
      header: 'Confirm sign the trip',
      message: 'Are you sure you want to sign selected trip?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Yes',
          handler: () => {

               // routerLink="/sign/{{ trip.Id }}"
                this.navController.navigateForward('/sign/' + Id)
              
          }
        }
      ]
    });
    await alert.present();
  }
    
  

}
