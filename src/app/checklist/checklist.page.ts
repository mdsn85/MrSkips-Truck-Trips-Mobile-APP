import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppPreferences } from '@ionic-native/app-preferences/ngx';
import { ToastService } from '../_services/toast.service';
import { ShiftService } from '../_services/shift.service';
import { User } from '../_models/User';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist.page.html',
  styleUrls: ['./checklist.page.scss'],
})
export class ChecklistPage implements OnInit {

  constructor(private toastService: ToastService, private navController: NavController,
    private appPreferences: AppPreferences, private shiftService: ShiftService) { }
  StartKM: any = 0;
  Remarks: any = '';
  checklist = [{
    val: 'LIGHTS & INDICATORS',
    isChecked: false,
    isMajor: false
  }, {
    val: 'ENGINE OIL LEVEL',
    isChecked: false,
    isMajor: true
  }, {
    val: 'HYDRAULIC OIL LEVEL',
    isChecked: false,
    isMajor: true
  }, {
    val: 'REDIATOR COOLENT LEVEL',
    isChecked: false,
    isMajor: true
  }, {
    val: 'WIPER & MIRROR',
    isChecked: false,
    isMajor: false
  }, {
    val: 'HYDRAULIC FUNCTION',
    isChecked: false,
    isMajor: true
  }, {
    val: 'ALL TYRES',
    isChecked: false,
    isMajor: false
  }, {
    val: 'VEHICLE CLEANLINESS',
    isChecked: false,
    isMajor: false
  }, {
    val: 'PPE & FIRST AID',
    isChecked: false,
    isMajor: false
  }, {
    val: 'UNIFORM',
    isChecked: false,
    isMajor: false
  }, {
    val: 'WARNING TRIANGLE',
    isChecked: false,
    isMajor: false
  }, {
    val: 'TARPAULINE',
    isChecked: false,
    isMajor: false
  }, {
    val: 'BODY DAMAGE',
    isChecked: false,
    isMajor: false
  }, {
    val: 'SEAT  BELT & A/C',
    isChecked: false,
    isMajor: true
  }, {
    val: 'TOOLS',
    isChecked: false,
    isMajor: true
  }, {
    val: 'VEHICLE PAPERS',
    isChecked: false,
    isMajor: true
  }, {
    val: 'FIRE EXTINGUSHER',
    isChecked: false,
    isMajor: true
  }];
  ngOnInit() {
    this.appPreferences.fetch('USER').then((user) => {
      user = user as User;
      this.StartKM = user.startKM;
    });
  }

  Submit() {
    const checklistObject = {
      LIGHTSINDICATORS: this.checklist[0].isChecked,
      ENGINEOILLEVEL: this.checklist[1].isChecked,
      HYDRAULICOILLEVEL: this.checklist[2].isChecked,
      REDIATORCOOLENTLEVEL: this.checklist[3].isChecked,
      WIPERMIRROR: this.checklist[4].isChecked,
      HYDRAULICFUNCTION: this.checklist[5].isChecked,
      ALLTYRES : this.checklist[6].isChecked,
      VEHICLECLEANLINESS: this.checklist[7].isChecked,
      PPEFIRSTAID: this.checklist[8].isChecked,
      UNIFORM: this.checklist[9].isChecked,
      WARNINGTRIANGLE: this.checklist[10].isChecked,
      TARPAULINE: this.checklist[11].isChecked,
      BODYDAMAGE: this.checklist[12].isChecked,
      SEATBELTAC: this.checklist[13].isChecked,
      TOOLS: this.checklist[14].isChecked,
      VEHICLEPAPERS: this.checklist[15].isChecked,
      FIREEXTINGUSHER: this.checklist[16].isChecked,
      reason: this.Remarks,
      StartKM: this.StartKM
    };
    let workingCar = true;
    this.checklist.forEach(element => {
      if (!element.isChecked && element.isMajor){
        workingCar = false;
      }
    });
    if(!workingCar) {
      this.toastService.presentError('Unable to start duty, please contact your supervisor.');
      return;
    }
    this.shiftService.SendCheckList(checklistObject).subscribe((result: any) => {
      if (result['Success']) {
        
        this.appPreferences.store('DUTY', 'true').then(() => {
          this.navController.navigateRoot('tabs/tab4');
        }, (error) => {
          this.toastService.presentError('Error while trying to save checklist.');
        });
      } else {
        if (result['ErrorCode'] === '403') {
          this.navController.navigateRoot('login');
        } else {
          this.toastService.presentError(result['Message']);
        }
      }
    }, (error) => {
      this.toastService.presentError('Server Error.');
    });
  }

  GoHome() {
    this.navController.navigateRoot('tabs/tab4');
  }

}
