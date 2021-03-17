import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Trip } from '../_models/Trip';
import { Skip } from '../_models/Skip';
import { AppPreferences } from '@ionic-native/app-preferences/ngx';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class TripsService {

  apiURL = 'http://2.48.3.94:5050/api/api/';
  // apiURL = 'http://192.168.1.253:50000/api/api/';
  token: any;
  constructor(private httpClient: HttpClient, private appPreferences: AppPreferences, private storage: Storage, 
    private navCtrl: NavController) {
    appPreferences.fetch('token').then((token) => {
      this.token = token;
    });
  }

  getTrips(date) {
    return this.httpClient.get(this.apiURL + 'GetDailyTripsbyDriver?token=' + this.token + '&date=' + date);
  }

  getUnsignedTrips() {
    return this.httpClient.get(this.apiURL + 'GetUnsignedTrips?token=' + this.token);
  }

  getUnsignedSkips(TripId) {
    console.log("sending " +TripId)

    if(typeof TripId != 'number' ){
      let params = new HttpParams();
      params = params.append('TripId', TripId.join(', '));
      params = params.append('token', this.token);


      //return this.httpClient.get(this.apiURL + 'getPendingSignatureSkipsByTrip', { params: params });
      return this.httpClient.get(this.apiURL + 'getPendingSignatureSkipsByTripArray?TripId='+TripId.join(',')+'&token=' + this.token);
    }
    return this.httpClient.get(this.apiURL + 'getPendingSignatureSkipsByTrip?TripId=' + TripId + '&token=' + this.token);
  }

  getTripDetails(tripId) {
    let trip: Trip;
    trip = {
      Id: 1,
      Name: 'Test',
      Location: 'test',
      Telephone: '539805155',
      Size: '5',
      Route:'',
      Skips: [{
        Id: 1
      },
      {
        Id: 2
      }]
    };
    return trip;
  }

  getCompletedTripDetails() {
    return this.httpClient.get(this.apiURL + 'GetCompletedTripsbyDriver?token=' + this.token);
  }

  punchIn(TripId) {
    return this.httpClient.get(this.apiURL + 'PunchIn?token=' + this.token + '&TripId=' + TripId);
  }

  getSkips(tripId) {
    let skips: Array<Skip>;
    skips = [{
      Id: 1,
      Serial: {Serial: '584496214'}
    },
    {
      Id: 2,
      Serial: {Serial: '584496215'}
    }];
    /*this.httpClient.get('', {params: { 'TripId': tripId }}).subscribe((data: Array<Skip>) => {
      skips = data;
    }, (error) => {
      console.log(error);
    });*/
    return skips;
  }

  getPendingSkips(tripId) {
    return this.httpClient.get(this.apiURL + 'getSkipsByTrip', {params: { 'TripId': tripId, 'token': this.token }})
  }

  async signSkip(formData: FormData) {
    formData.append('token', this.token);
    await this.httpClient.post(this.apiURL + 'signSkip', formData).subscribe((data: boolean) => {
      if (data['Success']) {
        return true;
      }
      else {
        if(data['ErrorCode'] === '403') {
          this.navCtrl.navigateRoot('/login');
        }
      }
    }, (error) => {
      return false;
    });
  }

  saveSkip(formData: FormData) {
    formData.append('token', this.token);
    return this.httpClient.post(this.apiURL + 'postSkip', formData);
  }

  sendEmails(data) {
    return this.httpClient.post(this.apiURL + 'SendEmails', data);
  }

  getSerialNumbers(tripId) {
    //return ['455528621', '645484215'];

    if(typeof tripId != 'number' ){


      //return this.httpClient.get(this.apiURL + 'getPendingSignatureSkipsByTrip', { params: params });
      return this.httpClient.get(this.apiURL + 'GetSerialNumbersArray?tripId='+tripId.join(',')+'&token=' + this.token);
    }

    return this.httpClient.get(this.apiURL + 'GetSerialNumbers?token=' + this.token + '&tripId=' + tripId);
   



  }

  addFuel(FuelReceipt: FormData) {
    FuelReceipt.append('token', this.token);
    return this.httpClient.post(this.apiURL + 'PostFuel/', FuelReceipt);
  }

  dumb(dumbLocationId) {
    return this.httpClient.get(this.apiURL + 'Dumb?token=' + this.token + '&DumbLocationId=' + dumbLocationId)
  }
  getTotalAmount(tripId){
    return this.httpClient.get(this.apiURL + 'GetTotalAmountByTrip?token=' + this.token + '&TripId=' + tripId) 
  }

  payCash(amount, tripId){
    return this.httpClient.get(this.apiURL + 'PayCash?token=' + this.token + '&TripId=' + tripId + '&Amount=' + amount)
  }

  getServiceTypes() {
    return this.httpClient.get(this.apiURL + 'GetServiceTypes?token=' + this.token )
  }

  getWasteTypes() {
    return this.httpClient.get(this.apiURL + 'GetWasteTypes?token=' + this.token )
  }

  getFuelProvider() {
    return this.httpClient.get(this.apiURL + 'GetFuelProvider?token=' + this.token )
  }

  
}

