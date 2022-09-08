import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { DonemodalPage } from 'src/app/modals/donemodal/donemodal.page';
import { ApiService } from 'src/app/services/api.service';
import { FirstService } from 'src/app/services/first.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-reportevent2',
  templateUrl: './reportevent2.page.html',
  styleUrls: ['./reportevent2.page.scss'],
})
export class Reportevent2Page implements OnInit {
  selectTest: any = '';
  email: any = '';
  message: any = "";
  err: any;
  profile: any;
  constructor(
    private navCtrl: NavController,
    private dataservice: FirstService,
    private modal: ModalController,
    private api: ApiService,
    private util: UtilService
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.api.getDataWithToken("profile").subscribe((success: any) => {
      if (success.success) {
        this.profile = success.data;
        this.util.dismissLoading();
      }
    }, err => {
      console.log(err);
      this.util.dismissLoading();
    })
  }
  goNext() {
    let tdata: any;
    this.util.translate.get("tick2").subscribe((d) => {
      tdata = d;
    })
    this.util.presentLoading();
    const fd = new FormData();
    fd.append("email", this.email);
    fd.append("message", this.message);
    if (this.selectTest == undefined) {
      delete fd["reason"];
    } else {
      fd.append("reason", this.selectTest);
    }

    fd.append("event_id", localStorage.getItem("report_id"));
    this.api.postDataWithToken("report-event", fd).subscribe((success: any) => {
      if (success.success) {
        this.util.presentToast(tdata.re);
        this.navCtrl.navigateForward('tabs/tab1');
        this.util.dismissLoading();
      }
    }, err => {
      console.log(err);
      this.err = err.error.errors;
      this.util.dismissLoading();
    })

  }
  input: any = []

  async presentModal() {
    const modal = await this.modal.create({
      component: DonemodalPage,
      backdropDismiss: true,
      cssClass: 'modall-stylee'
    });
    modal.onDidDismiss().then((res) => {
      console.log(res);
      this.selectTest = res.data
      console.log("df", this.selectTest);

    })
    return await modal.present();
  }

}
