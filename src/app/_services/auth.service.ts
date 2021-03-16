import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { User } from '../_models/User';
import { LoginInfo } from '../_models/LoginInfo';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl = 'http://2.48.3.94:5050/api/api';
  // apiUrl = 'http://192.168.1.253:50000/api/api';
  constructor(private http: HttpClient) { }

  login(username, password) {
    return this.http.get(this.apiUrl + '/Login?username=' + username + '&password=' + password);
  }

}


