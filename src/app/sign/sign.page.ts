import { Component, OnInit, ViewChild } from '@angular/core';
import { Skip } from '../_models/Skip';
import { Router, ActivatedRoute } from '@angular/router';
import { TripsService } from '../_services/trips.service';
import { FormsModule } from '@angular/forms';
import { Trip } from '../_models/Trip';
import { ToastService } from '../_services/toast.service';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.page.html',
  styleUrls: ['./sign.page.scss'],
})
export class SignPage implements OnInit {
  skips: Array<Skip>;
  trip: Trip = {
    Id: 0,
    Location: '',
    Name: '',
    Size: '',
    Skips: [],
    Telephone: '',
    Route:''
  };
  Serials: String[];
  @ViewChild(SignaturePad) public signaturePad: SignaturePad;
  public signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 2,
    'canvasWidth': 1000,
    'canvasHeight': 200  
  };
  
  signature: any;

  showSignature = false;
  signMobile: any;
  signTel: any;
  signName: any;

  signed: boolean = false;
  constructor(private navCtrl: NavController, private router: Router,
    private tripService: TripsService, private toastService: ToastService, private plt: Platform,
    private route: ActivatedRoute,) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log("Sign id ="+id + " type = "+typeof id);
    if(typeof id == 'number'){
      console.log("number")
      this.tripService.getUnsignedSkips(id).subscribe((data) => {
        if (data['Success']) {
          this.skips = data['Skips'] as Array<Skip>;
          this.trip.Skips = this.skips;
          /*this.tripService.getSerialNumbers(id).subscribe((data: String[]) => {
            this.Serials = data;
          }, (error) => {
            this.Serials = [];
          });;*/
        }
        else {
          if(data['ErrorCode'] === '403'){
            this.navCtrl.navigateRoot('/login');
          }
        }
      }, (error) => {
        console.log(error);
      });
    }else
    {
      console.log("number")
      let Ids=JSON.parse(id);

      console.log(Ids.length+"   passed to sign with type + "+typeof Ids);

      this.tripService.getUnsignedSkips(Ids).subscribe((data) => {
        if (data['Success']) {
          this.skips = data['Skips'] as Array<Skip>;
          this.trip.Skips = this.skips;
         /* this.tripService.getSerialNumbers(Ids).subscribe((data: String[]) => {
            this.Serials = data;
          }, (error) => {
            this.Serials = [];
          });;*/
        }
        else {
          if(data['ErrorCode'] === '403'){
            this.navCtrl.navigateRoot('/login');
          }
        }
      });
    }
  }

  async Sign(){
    this.saveCanvasImage();
    if (!this.signed) {
      this.toastService.presentError('Please sign the skips.');
      return;
    }
    let SkipsClone: Array<Skip> = this.trip.Skips.map(x => Object.assign({}, x));
    let result = true
    SkipsClone.forEach(async function(skip) {
      let formData: FormData;
      formData = new FormData();
      formData.append('Id', skip.Id.toString());
      formData.append('file', this.signature, "signature");

      formData.append('SignMobile', this.signMobile === undefined ? "" : this.signMobile);
      formData.append('SignTel', this.signTel === undefined ? "" : this.signTel);
      formData.append('SignName', this.signName === undefined ? "" : this.signName);


      result = await result && this.tripService.signSkip(formData);
    }, this);
    if (result){
      this.navCtrl.navigateBack('tabs/s-trips');
    }
  }

  log(skip) {
    console.log(skip);
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

  ShowSignaturePad() {
    this.showSignature = true;
  }

  resetSignature() {
    this.signaturePad.clear();
  }



  SaveSignature(){
    this.saveCanvasImage() 
  }
}
