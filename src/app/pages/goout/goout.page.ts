import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-goout',
  templateUrl: './goout.page.html',
  styleUrls: ['./goout.page.scss'],
})
export class GooutPage implements OnInit {
  today: string;
  dt: number;
  dates: Date;
  datess: string;
  select: any = 'All';
  constructor(
    private navCtrl: NavController,
    private util: UtilService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    this.today = yyyy + '-' + mm + '-' + dd;
    this.dates = today;
  }

  goBack() {
    this.navCtrl.back();
  }

  heading: any = [
    {
      name: 'All'
    },
    {
      name: 'Today'
    },
    {
      name: 'Tommorow'
    },
    {
      name: 'This Week'
    },
    {
      name: 'Choose a date'
    },
  ]

  event(r) {
    console.log(r);
    this.select = r;
    this.util.go = this.select;
    this.util.data.next(true);

  }
  date(e): void {
    this.dates = new Date(e.detail.value);
    console.log(this.dates.getFullYear() + '-' + (this.dates.getMonth() + 1) + '-' + this.dates.getDate());
    this.datess = this.dates.getFullYear() + '-' + (this.dates.getMonth() + 1) + '-' + this.dates.getDate();
  }

  goN() {
    if (this.datess == undefined && this.select == 'Choose a date') {
      this.util.presentToast("Select any date");
    } else {
      if (this.select == 'Choose a date') {
        this.util.go = this.datess;
        this.util.data.next(true);
      }
      this.navCtrl.navigateForward("tabs/tab2");
    }
  }


}
