import { Component, OnDestroy } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Trip } from '../_models/Trip';
import { ShiftService } from '../_services/shift.service';
import { RouterPage } from '../_interfaces/RouterPage';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../_services/toast.service';
import { TripsService } from '../_services/trips.service';
import { formatDate } from '@angular/common';
import { dateCalc } from "../Helper/dateCalc";
import * as moment from 'moment';
import { DatePicker } from '@ionic-native/date-picker/ngx';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page extends RouterPage implements OnDestroy {
  trips: Trip[];
  allTrips: Trip[] = [];
  startedDuty: Boolean;
  startDate: Date;


  endDate: Date;
  _dateCalc:dateCalc;
  searchQuery: string = '';

  tripsDate = new Date;
  textTripsDate = moment(this.tripsDate).format("DD-MM-YYYY");

  constructor(private alertCtrl: AlertController, private shiftService: ShiftService,
    private route: ActivatedRoute, private router: Router, private tripsService: TripsService,
    private toastService: ToastService, private navController: NavController,    private datePicker: DatePicker ) {
    super(router, route);
    this._dateCalc = new dateCalc();


  }
  onDestroy() {
    super.ngOnDestroy();
   
  }
  ionViewCanEnter(){
    console.log("2-Enter Completed Trips")
  }


  onEnter(){
     console.log("Enter Completed Trips")
    this.startDate = undefined;
    this.endDate = undefined;
    this.tripsService.getCompletedTripDetails().subscribe((trips: any) => {
      if (trips['Success']) {
        this.allTrips = trips['Trips'] as Array<Trip>;
        this.trips = this.allTrips;

      } else {
        if (trips['ErrorCode'] === '403') {
          this.navController.navigateBack('/login');
        } else {
          this.toastService.presentError('Error while getting trips from server.');
        }
      }
    }, (Error) => {
      this.toastService.presentError('Please check your internet connection.');
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
  }

  filterTrips(ev: any) {
    this.searchQuery = ev.target.value;
    this.trips = this.allTrips.filter((trip: Trip) => {
      return trip.Name.toLowerCase().indexOf(this.searchQuery.toLowerCase()) > -1;
    });

    if(this.startDate !== undefined && this.endDate !== undefined){
      this.trips = this.trips.filter((trip: Trip) => {
          return trip.Date >= this.startDate && trip.Date <= this.endDate;
      });
      console.log("this.trips -"+this.trips.length)
    }



    if(this.startDate !== undefined && this.endDate === undefined){
      let selecteddate = this._dateCalc.ConvertStringToDate(this.startDate);
      selecteddate.setDate(selecteddate.getDate()+1);
      var x: any = this._dateCalc.formatDate(selecteddate);
      var y:Date=x;
      
      this.trips = this.trips.filter((trip: Trip) => {
          return trip.Date >= this.startDate && trip.Date <= y;
      });
    }

  }

  filterStartDateTrips(ev: any) {

    let selecteddate = this._dateCalc.ConvertStringToDate(this.startDate);
    //selecteddate = this.formatDate(selecteddate);
    console.log(" Selected Start date :"+this.startDate);
    console.log(" Selected selecteddate :"+selecteddate);

    if(this.endDate !== undefined){
      var y:Date=this.endDate;
     }else
     {
       selecteddate.setDate(selecteddate.getDate()+1);
       var x: any = this._dateCalc.formatDate(selecteddate);
       var y:Date=x;
     }

    this.trips = this.allTrips.filter( (trip: Trip) => {
      return trip.Date >= this.startDate && trip.Date <= y;     
    });
  }
//RKP
  async filterEndDateTrips(ev: any) {
    //this.endDate = ev.target.value;
    let selecteddate = this._dateCalc.ConvertStringToDate(this.endDate);

    selecteddate.setDate(selecteddate.getDate()+1);
    let x: any = this._dateCalc.formatDate(selecteddate);
    let y:Date=x;

    if(this.startDate != undefined){
      this.trips = this.allTrips.filter((trip: Trip) => {
          return trip.Date >= this.startDate && trip.Date <= y;
      });
    }
  }
/*
  filterStartDateTrips(ev: any) {
    this.startDate = ev.target.value;
    this.trips = this.allTrips.filter((trip: Trip) => {
      var filterDate = new Date();
      //filterDate.setDate(this.startDate.getDate() - 1);
      if(this.endDate !== undefined){
        return trip.Date >= this.startDate && trip.Date <= this.endDate;
      }
      return trip.Date >= this.startDate;
    });
  }

  filterEndDateTrips(ev: any) {
    this.endDate = ev.target.value;
    this.trips = this.allTrips.filter((trip: Trip) => {
      if(this.startDate !== undefined){
        return trip.Date >= this.startDate && trip.Date <= this.endDate;
      }
      return trip.Date <= this.endDate;
    });
  }
  */
 openDatePickerEnd(){
  this.datePicker.show({
    date: this.tripsDate,
    mode: 'date',
    androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
  }).then(
    date => {
      //this.tripsDate = date;
      //this.appPreferences.store('Trips', 'TripsFilterDate', date)
     // this.textTripsDate = moment(this.tripsDate).format("DD-MM-YYYY")
      //this.refreshTrips()
    },
    err => console.log('Error occurred while getting date: ', err)
  );
 }
 openDatePicker() {
  this.datePicker.show({
    date: this.tripsDate,
    mode: 'date',
    androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
  }).then(
    date => {
      //this.tripsDate = date;
      //this.appPreferences.store('Trips', 'TripsFilterDate', date)
     // this.textTripsDate = moment(this.tripsDate).format("DD-MM-YYYY")
      //this.refreshTrips()

      this.startDate =date;
      var apiFormattedDate = moment(this.startDate).format("DD-MM-YYYY");

      console.log("2-Selected start date :" +  apiFormattedDate);
     
      this.trips = this.allTrips.filter( (trip: Trip) => {
        //var filterDate = new Date();
        //filterDate.setDate(this.startDate.getDate() - 1);
        if(this.endDate !== undefined){
          console.log("Selected End date :"+this.endDate+" Selected Start date :"+this.startDate);
  
          return trip.Date >= this.startDate && trip.Date <= this.endDate;
        }else
        {
          let endDate1 = new Date();
          endDate1.setDate(this.startDate.getDate()+1);
          let x: any = this._dateCalc.formatDate(endDate1);
          let y:Date=x;
          //this.endDate = x;
          console.log("Selected End date :"+this.endDate+" Selected Start date :"+this.startDate);
          
          return trip.Date >= this.startDate && trip.Date <= y;
        }
        //return trip.Date >= this.startDate;
      });


    },
    err => console.log('Error occurred while getting date: ', err)
  );
}
}
