import { Component } from '@angular/core';
import { Fuel } from '../_models/fuel';
import { ToastService } from '../_services/toast.service';
import { TripsService } from '../_services/trips.service';
import { NavController, LoadingController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { load } from '@angular/core/src/render3';

@Component({
  selector: 'app-fuel',
  templateUrl: 'fuel.page.html',
  styleUrls: ['fuel.page.scss']
})



export class FuelPage {
   now1:Date = new Date();
    tzoffset = (this.now1).getTimezoneOffset() * 60000; //offset in milliseconds
    localISOTime = (new Date(Date.now() - this.tzoffset)).toISOString().slice(0, -1);
  fuel: Fuel = {
    Id: 0,
    Quantity: null,
    Amount: null,
    Rate: null,
    Provider: '',
    Image: '',
    Unit: '',
    ReciptDate:null
  };

  FuelProvider: Array<any>;
  message : any ;
  constructor(private toastService: ToastService, private tripService: TripsService, private nvaController: NavController,
    private camera: Camera, private file: File, private loadingController: LoadingController) {}

    ngOnInit(){
      console.log("2-Enter Completed Trips");
      this.onEnter();
      const currdate = this.getCurrentDate();
      this.fuel.ReciptDate = currdate;
    }

    getCurrentDate() {
      const date = new Date();
      return this.dateFormat(date, "yyyy-MM-ddTHH:mm:ss+08:00");
    }

    dateFormat(date: Date, sFormat: String = 'yyyy-MM-dd'): string {
      let time = {
        Year: 0,
        TYear: '0',
        Month: 0,
        TMonth: '0',
        Day: 0,
        TDay: '0',
        Hour: 0,
        THour: '0',
        hour: 0,
        Thour: '0',
        Minute: 0,
        TMinute: '0',
        Second: 0,
        TSecond: '0',
        Millisecond: 0
      };
      time.Year = date.getFullYear();
      time.TYear = String(time.Year).substr(2);
      time.Month = date.getMonth() + 1;
      time.TMonth = time.Month < 10 ? "0" + time.Month : String(time.Month);
      time.Day = date.getDate();
      time.TDay = time.Day < 10 ? "0" + time.Day : String(time.Day);
      time.Hour = date.getHours();
      time.THour = time.Hour < 10 ? "0" + time.Hour : String(time.Hour);
      time.hour = time.Hour < 13 ? time.Hour : time.Hour - 12;
      time.Thour = time.hour < 10 ? "0" + time.hour : String(time.hour);
      time.Minute = date.getMinutes();
      time.TMinute = time.Minute < 10 ? "0" + time.Minute : String(time.Minute);
      time.Second = date.getSeconds();
      time.TSecond = time.Second < 10 ? "0" + time.Second : String(time.Second);
      time.Millisecond = date.getMilliseconds();
   
      return sFormat.replace(/yyyy/ig, String(time.Year))
        .replace(/yyy/ig, String(time.Year))
        .replace(/yy/ig, time.TYear)
        .replace(/y/ig, time.TYear)
        .replace(/MM/g, time.TMonth)
        .replace(/M/g, String(time.Month))
        .replace(/dd/ig, time.TDay)
        .replace(/d/ig, String(time.Day))
        .replace(/HH/g, time.THour)
        .replace(/H/g, String(time.Hour))
        .replace(/hh/g, time.Thour)
        .replace(/h/g, String(time.hour))
        .replace(/mm/g, time.TMinute)
        .replace(/m/g, String(time.Minute))
        .replace(/ss/ig, time.TSecond)
        .replace(/s/ig, String(time.Second))
        .replace(/fff/ig, String(time.Millisecond))
    }
  
    
  onEnter() {
    console.log("fuel:Enter");
      this.tripService.getFuelProvider().subscribe((data) => {
        if ( data['Success']) {
          this.FuelProvider = data['FuelProviders'];
          console.log("fuel:"+ JSON.stringify(this.FuelProvider))
        } else {
          if (data['ErrorCode'] === '403') {
            this.nvaController.navigateBack('login');
          } else {
            this.toastService.presentError(data['Message']);
          }
        }
      }, (error) => {
        this.toastService.presentError('Please check your internet connection.');
      });
  }
  calculateAmount() {
    if(this.fuel.Rate != null && this.fuel.Quantity != null) {
      console.log(this.fuel.Quantity);
      console.log(this.fuel.Rate);
      this.fuel.Amount = this.fuel.Rate * this.fuel.Quantity;
    }
  }
  
  takePhoto() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    this.camera.getPicture(options).then(imageData => {
      this.fuel.Image = imageData;
    }, error => console.log(JSON.stringify(error)));
  }

  Validate(){
    this.message ="";
    if (this.fuel.Provider== null || this.fuel.Provider == ''){
      this.message = "Please fill fuel Provider "
      return  false;
    }
    if (this.fuel.ReciptDate== null || this.fuel.ReciptDate == ''){
      this.message = "Please fill Receipt Date"
      return  false;
    }
    if (this.fuel.Quantity ==null || this.fuel.Quantity == ''){
      this.message = "Please fill Quantity "
      return  false;
    }
    if (this.fuel.Unit ==null || this.fuel.Unit == 0){
      this.message = "Please select Unit "
      return  false;
    }

    if (this.fuel.Rate == null || this.fuel.Rate == ''){
      this.message = "Please fill Rate "
      return  false;
    }


    return true;



    console.log("unit: "+this.fuel.Unit);
    console.log("ReciptDate:"+this.fuel.ReciptDate.toString());


  }
  async Submit() {

    if(this.Validate()){
      const loading = await this.loadingController.create({
        spinner: null,
        message: 'Please wait...',
        translucent: true
      });
      await loading.present();
      this.file.resolveLocalFilesystemUrl(this.fuel.Image)
          .then((entry : FileEntry) => {
              ( < FileEntry > entry).file(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const formData = new FormData();
                    const imgBlob = new Blob([reader.result], {
                        type: file.type
                    });
                    console.log( "fuel provider: " + this.fuel.Provider.toString());
                    formData.append('file', imgBlob, file.name);
                    formData.append('Quantity', this.fuel.Quantity.toString());
                    formData.append('Amount', (this.fuel.Amount != null ? this.fuel.Amount.toString() : "-1"));
                    formData.append('Rate', (this.fuel.Rate != null ? this.fuel.Rate.toString() : "-1"));
                    formData.append('Provider', this.fuel.Provider);
                    formData.append('unit', this.fuel.Unit.toString());
                    let rdate= this.fuel.ReciptDate.toString().replace("T"," ");
                     rdate= rdate.replace("Z","");
                     console.log("fuel.ReciptDate = "+ rdate);
                    formData.append('ReciptDate', rdate);
                   
                   // console.log("ReciptDate:"+this.fuel.ReciptDate.toString());
                    this.tripService.addFuel(formData).subscribe((result: any) => {
                      if (result['Success']) {
                        this.toastService.presentSuccess('Receipt added successfully.');
                        this.fuel.Amount = null;
                        this.fuel.Quantity = null;
                        this.fuel.Rate = null;
                        this.fuel.Provider = '';
                        this.fuel.ReciptDate =null;
                      }
                      else {
                        if( result['ErrorCode'] === '403') {
                          this.nvaController.navigateRoot('login');
                        }
                        else {
                          this.toastService.presentError('Error while saving the fuel receipt.');
                        }
                      }
                    }, (error) => {
                      this.toastService.presentError("Server Error!");
                    });
                    loading.dismiss();
                };
                reader.readAsArrayBuffer(file);
              })
          })
          .catch(err => {
            loading.dismiss();
            this.toastService.presentError('Please Take Photo Of Receipt copy.');
          });
          loading.dismiss();
      }
  }
}
