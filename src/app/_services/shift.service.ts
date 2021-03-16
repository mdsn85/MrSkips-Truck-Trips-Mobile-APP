import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppPreferences } from '@ionic-native/app-preferences/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  apiUrl = 'http://2.48.3.94:5050/api/api';
  // apiUrl = 'http://192.168.1.253:50000/api/api';
  token: any = '';
  gotToken: boolean = false;
  constructor(private httpClient: HttpClient, private appPreferences: AppPreferences, private storage: Storage) {
    appPreferences.fetch('token').then((token) => {
      this.gotToken = true;
      this.token = token;
      console.log(token);
    });
  }

  StartShift() {
    return this.httpClient.get(this.apiUrl + '/StartShift?token=' + this.token);
  }

  StopShift(endKM) {
    return this.httpClient.get(this.apiUrl + '/StopShift?token=' + this.token + '&endKM=' + endKM);
  }

  CheckShift() {
    return this.httpClient.get(this.apiUrl + '/CheckShiftStatus?token=' + this.token);
  }

  SendCheckList(checklist) {
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json' );
    checklist.token = this.token;
    return this.httpClient.post(this.apiUrl + '/SaveCheckList', checklist, { headers: headers });
  }

  RefreshUser() {
    return this.httpClient.get(this.apiUrl + '/RefreshTripSheet?token=' + this.token);
  }

  GetDumbLocations() {
    return this.httpClient.get(this.apiUrl + '/GetDumbLocations?token=' + this.token);
  }
}
