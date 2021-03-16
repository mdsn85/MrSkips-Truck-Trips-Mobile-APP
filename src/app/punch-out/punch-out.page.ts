import { Component, OnInit, ViewChild } from '@angular/core';
import { Events } from '@ionic/angular';
import { Skip } from '../_models/Skip';
import { Router, ActivatedRoute } from '@angular/router';
import { TripsService } from '../_services/trips.service';
import { FormsModule } from '@angular/forms';
import { Trip } from '../_models/Trip';
import { SerialNumber } from '../_models/Serial';
import { ToastService } from '../_services/toast.service';
import { NavController, Platform, LoadingController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { IonicSelectableComponent } from 'ionic-selectable';


@Component({
  selector: 'app-punch-out',
  templateUrl: './punch-out.page.html',
  styleUrls: ['./punch-out.page.scss'],
})
export class PunchOutPage implements OnInit {
  trip: Trip = {
    Id: 0,
    Location: '',
    Name: '',
    Size: '',
    Skips: [],
    Telephone: '',
    Route:'',
    AmountCollected:0
  };
  listSerials: SerialNumber[];
  selectedStatuses: any[];
  signature: any;
  signed: boolean = false;
  SuccessSkips = 0;
  FailedSkips = 0;
  ToBeRequestedSkips = 0;
  listGenerator = false;
  skipsGenerator: any;
  serviceTypes: Array<any>;
  wasteTypes: Array<any>;
  showSignature = false;
  signMobile: any;
  signTel: any;
  signName: any;
  NumOfSkips: any;
  loading: any;
  emailSent: Boolean = false;

  @ViewChild(SignaturePad) public signaturePad: SignaturePad;
  public signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 2,
    'canvasWidth': 1000,
    'canvasHeight': 200  
  };
  constructor(private navCtrl: NavController, private router: Router,
    private tripService: TripsService, private toastService: ToastService, private plt: Platform,
    private route: ActivatedRoute, private camera: Camera, private file: File,
    private loadingController: LoadingController, public events: Events) { 
    }

  portChange(event: {
      component: IonicSelectableComponent,
      value: any
    }) {
      console.log('port:', event.value);
    }
  ngOnInit() {
    this.listSerials = [];
    this.skipsGenerator = {};
    this.skipsGenerator.WasteType = "General";
    this.skipsGenerator.Status = -1;
    const id = this.route.snapshot.paramMap.get('id');
    this.tripService.getPendingSkips(id).subscribe((data) => {
      if (data['Success']) {
        this.trip = data['Skips'] as Trip;
        this.skipsGenerator.DO = this.trip.DoNum;
        this.trip.Skips = [];
        for (var i = 0; i < this.trip.NumOfSkips; i++ ) {
          this.trip.Skips.push({ Id: i, DO: this.trip.DoNum, WasteType: "General", Status: -1 });
        }
        this.trip.Skips.forEach((skip: Skip) => {
          skip.Copy = false;
        });
        this.tripService.getSerialNumbers(id).subscribe((data) => {
          if(data["Success"]) {
            let Serials = data["SerialNumbers"];
            Serials.forEach(function(serial) {
              this.listSerials.push({Serial: serial});
            }.bind(this));
          }
        }, (error) => {
          let Serials = [];
          this.listSerials = [];
        });;
      }
      else {
        if(data['ErrorCode'] === '403'){
          this.navCtrl.navigateRoot('/login');
        }
      }
    }, (error) => {
      console.log(error);
    });

    this.tripService.getWasteTypes().subscribe((data) => {
      if ( data['Success']) {
        this.wasteTypes = data['WasteTypes'];
      } else {
        if (data['ErrorCode'] === '403') {
          this.navCtrl.navigateBack('login');
        } else {
          this.toastService.presentError(data['Message']);
        }
      }
    }, (error) => {
      this.toastService.presentError('Please check your internet connection.');
    });
    
    this.tripService.getServiceTypes().subscribe((data) => {
      if ( data['Success']) {
        this.serviceTypes = data['ServiceTypes'];
      } else {
        if (data['ErrorCode'] === '403') {
          this.navCtrl.navigateBack('login');
        } else {
          this.toastService.presentError(data['Message']);
        }
      }
    }, (error) => {
      this.toastService.presentError('Please check your internet connection.');
    });
    
  }

  takePhoto(skip: Skip) {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    this.camera.getPicture(options).then(imageData => {
      this.file.resolveLocalFilesystemUrl(imageData)
          .then(async (entry : FileEntry) => {
              console.log('ReadingFile');
              await ( < FileEntry > entry).file(async file => {
                console.log('Reading file 2');
                const reader = new FileReader();
                reader.onloadend = () => {
                    const imgBlob = new Blob([reader.result], {
                        type: file.type
                    });
                    skip.Image = imgBlob;
                };
                await reader.readAsArrayBuffer(file);
              });
              this.toastService.presentSuccess('Picture was taken successfully');
          });
    }, error => console.log(JSON.stringify(error)));
  }

  duplicate(skip) {
    const newSkip: Skip = Object.assign({}, skip);
    newSkip.Copy = true;
    newSkip.Id = this.trip.Skips.length + 1;
    this.trip.Skips.push(newSkip);
    this.trip.NumOfSkips++;
    this.trip.Skips = [...this.trip.Skips];
  }

  remove(skip) {
    const index = this.trip.Skips.indexOf(skip);
    this.trip.Skips.splice(index, 1);
    this.trip.NumOfSkips--;
    this.trip.Skips = [...this.trip.Skips];
  }

  CheckResults() {
    if (this.loading != undefined){
      this.loading.dismiss();
      this.loading = undefined;
    }
    console.log(this.SuccessSkips)
    console.log(this.ToBeRequestedSkips)

    if (this.FailedSkips + this.SuccessSkips == this.ToBeRequestedSkips && !this.emailSent) {
      
      let emailData = {
        'selectedStatuses': this.selectedStatuses,
        'tripId': this.trip.Id
      };
      this.tripService.sendEmails(emailData).subscribe();
      this.emailSent = true;
    }
    if(this.FailedSkips == 0) {
      if ( this.SuccessSkips >= this.trip.NumOfSkips ){
        this.events.publish('refreshed-trips');
        this.navCtrl.navigateRoot('tabs/trips');
      }
      else{
        this.toastService.presentSuccess('Skips Punched out successfully.')
      }
    }
    else {
      this.toastService.presentError('Error while saving some of your skips.');
    }
    this.trip.Skips = [...this.trip.Skips];
  }


  CompletedTripsWithoutSignature(){
    console.log("Enter CompletedTripsWithoutSignature");
    let stopProcess = false;
    let signed =  this.signed;
    this.trip.Skips.forEach(function(skip) {
      if(skip.Status != undefined && skip.Status != -1) {
        if(skip.Status == 0 && (signed === undefined || !signed)) {
          
          console.log("You have completed skips, please sign before punching out.");
          stopProcess = true;
        }
      }
    });
    
    return stopProcess;
  }
  
  async PunchOut() {
    
    if (this.CompletedTripsWithoutSignature()){
      //this.loading.dismiss();
      this.toastService.presentError('You have completed skips, please sign before punching out.');
      return false;
    }
    console.log("if no sign should not see message");
    this.emailSent = false;
    if (this.loading == undefined) {
      this.loading = await this.loadingController.create({
        spinner: "dots",
        message: 'Punching out.'
      });
      await this.loading.present();
    }
    this.saveCanvasImage();
    let Error: Boolean = false;
    let SkipsClone: Array<Skip> = this.trip.Skips.map(x => Object.assign({}, x));
    let locked = false;
    const delay = ms => new Promise(res => setTimeout(res, ms));
    this.selectedStatuses = [];
    SkipsClone.forEach(async function(skip) {
      if(skip.Status != undefined && skip.Status != -1) {

        if (!this.selectedStatuses.includes(skip.Status)) {
          this.selectedStatuses.push(skip.Status);
        } 
        this.ToBeRequestedSkips++;
      }
    }.bind(this))

    SkipsClone.forEach(async function(skip) {
      while (locked) {
        await delay(200)
        console.log('locked');
      } 
      locked = true;
      console.log('Start')
      if(skip.Status == undefined || skip.Status == -1) {
        locked = false;
        return;
      }
      let formData: FormData;
      formData = new FormData();
      formData.append('DO', skip.DO);
      formData.append('TripId', this.trip.Id);
      formData.append('Serial', skip.Serial == undefined ? "" : skip.Serial.Serial);
      formData.append('Serial2', skip.Serial2 === undefined ? "" : skip.Serial2);
      formData.append('WasteType', skip.WasteType);
      formData.append('Status', skip.Status === undefined ? '' : skip.Status.toString());
      formData.append('Weight', skip.Weight === undefined ? '' : skip.Weight.toString());
      formData.append('Remarks', skip.Remarks === undefined ? "" : skip.Remarks);
      formData.append('IsCopy', skip.Copy);
      formData.append('Reason', skip.Reason === undefined ? "" : skip.Reason);
      if(this.signed) {
        formData.append('file', this.signature, "signature");
        formData.append('SignMobile', this.signMobile === undefined ? "" : this.signMobile);
        formData.append('SignTel', this.signTel === undefined ? "" : this.signTel);
        formData.append('SignName', this.signName === undefined ? "" : this.signName);
        
      }
      if (skip.Status > 0) {
        if (skip.Image != undefined) {
          formData.append('file', skip.Image, 'reasonImage');
        }
        console.log('sending request')
        await this.tripService.saveSkip(formData).subscribe((data: boolean) => {
          if (data['Success']) {
            this.SuccessSkips++;
            this.trip.Skips.splice((this.trip.Skips as Array<Skip>).map(function(e) { return e.Id; }).indexOf(skip.Id), 1);
            let counter = 0;
            let index = -1;
            this.listSerials.forEach(serial => {
              if (serial.Serial == skip.Serial.Serial){
                index = counter;

              }
              counter++;
            });
            if (index > -1) {
              this.listSerials.splice(index, 1);
            }
            if ((this.SuccessSkips + this.FailedSkips) == this.ToBeRequestedSkips){
              this.CheckResults();
            }
          }
          else {
            if(data['ErrorCode'] === '403') {
              this.navCtrl.navigateRoot('/login');
            }
            else {
              this.FailedSkips++
            }
          }
          if ((this.SuccessSkips + this.FailedSkips) == this.ToBeRequestedSkips){
            this.CheckResults();
          }
        }, (error) => {
          this.FailedSkips++;
          if ((this.SuccessSkips + this.FailedSkips) == this.ToBeRequestedSkips){
            this.CheckResults();
          }
        });
      
        
        console.log('after Request')
      }
      else {
        
        
        console.log('seinding request')
        await this.tripService.saveSkip(formData).subscribe((data: boolean) => {
          if (data['Success']) {
            this.SuccessSkips++;
            this.trip.Skips.splice((this.trip.Skips as Array<Skip>).map(function(e) { return e.Id; }).indexOf(skip.Id), 1);
            let counter = 0;
            let index = -1;
            this.listSerials.forEach(serial => {
              if (serial.Serial == skip.Serial.Serial){
                index = counter;

              }
              counter++;
            });
            if (index > -1) {
              this.listSerials.splice(index, 1);
            }
            if ((this.SuccessSkips + this.FailedSkips) == this.ToBeRequestedSkips){
              this.CheckResults();
            }
          }
          else {
            if(data['ErrorCode'] === '403') {
              this.navCtrl.navigateRoot('/login');
            }
            else {
              this.FailedSkips++;
            }
          }
        }, (error) => {
          this.FailedSkips++;
          if ((this.SuccessSkips + this.FailedSkips) == this.ToBeRequestedSkips){
            this.CheckResults();
          }
        });
        
        console.log('after Request')
      }
      console.log('End')
      locked = false;
    }.bind(this));
    if (this.loading != undefined) {
      this.loading.dismiss();
      this.loading = undefined;

    }
  }
  log(skip) {
    console.log(skip);
    if (skip.Status == '3') {
      console.log('BLAA')
    }
  }

  ngAfterViewInit() {
    // this.signaturePad is now available
    if (this.signaturePad != undefined){
      this.signaturePad.set('minWidth', 5); // set szimek/signature_pad options at runtime
      this.signaturePad.clear(); // invoke functions from szimek/signature_pad API
    }
  }

  drawComplete() {
    // will be notified of szimek/signature_pad's onEnd event
    console.log(this.signaturePad.toDataURL());
  }

  drawStart() {
    // will be notified of szimek/signature_pad's onBegin event
    console.log('begin drawing');
    this.signed = true;
  }

  saveCanvasImage() {
    const dataUrl = this.signaturePad.toDataURL();

    this.signaturePad.clear();
    const data = dataUrl.split(',')[1];
    this.signature = this.b64toBlob(data, 'image/png');
  }

  resetSignature() {
    this.signaturePad.clear();
    this.signed= false;
  }

  // https://forum.ionicframework.com/t/save-base64-encoded-image-to-specific-filepath/96180/3
  b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    const sliceSize = 512;
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
  generateSkips() {
    this.trip.Skips = [];
    let index = 0;
    console.log(this.skipsGenerator);
    if (this.NumOfSkips !== undefined) {
      for (let i = 0; i < this.NumOfSkips; i++) {
        this.trip.Skips.push({
          Id: index,
          Serial: {Serial: 'N/A'},
          Copy: false,
          DO: this.skipsGenerator.DO,
          Reason: this.skipsGenerator.Reason,
          Remarks: this.skipsGenerator.Remarks,
          Status: this.skipsGenerator.Status,
          WasteType: this.skipsGenerator.WasteType,
          Weight: parseFloat((this.skipsGenerator.Weight / this.NumOfSkips).toFixed(2))
        });
        index++;
      }
    }
    else {
      this.skipsGenerator.Serials.forEach(element => {
        this.trip.Skips.push({
          Id: index,
          Serial: element,
          Copy: false,
          DO: this.skipsGenerator.DO,
          Reason: this.skipsGenerator.Reason,
          Remarks: this.skipsGenerator.Remarks,
          Status: this.skipsGenerator.Status,
          WasteType: this.skipsGenerator.WasteType,
          Weight: parseFloat((this.skipsGenerator.Weight / this.skipsGenerator.Serials.length).toFixed(2))
        });
        index++;
      });
    }
    this.skipsGenerator.Reason = "";
    this.skipsGenerator.Remarks = "";
    this.skipsGenerator.Status = -1;
    this.skipsGenerator.WasteType = "General";
    this.skipsGenerator.Weight = undefined;
    this.skipsGenerator.Serials = [];
    
    this.NumOfSkips = undefined;
    this.listGenerator = false;
  }

  ShowSignaturePad() {
    this.showSignature = true;
  }
}
