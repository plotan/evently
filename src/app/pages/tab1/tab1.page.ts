import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Component, Input } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SocialSharingPage } from 'src/app/modals/social-sharing/social-sharing.page';
import { ApiService } from 'src/app/services/api.service';
import { FirstService } from 'src/app/services/first.service';
import { UtilService } from 'src/app/services/util.service';
import { Address } from "ngx-google-places-autocomplete/objects/address";
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { HttpClient } from '@angular/common/http';
import { Category } from 'src/app/modals/category.model';
@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
})
export class Tab1Page {
  event: any;
  latCoordinates: any;
  address: any;
  lan: any;
  lat: string;
  lang: string;
  local: any = [];
  isFrom: string;
  latitude: number;
  longitude: number;
  categories: Category[] = [];
  
  highlights=[];
  featured=[];
  catSlideOpts={

    slidesPerView: 1.5,
    centeredSlides:true,
    loop:true,
    spaceBetween:10,
    autoplay:true

};
  constructor(
    private navCtrl: NavController,
    private dataservice: FirstService,
    private util: UtilService,
    private api: ApiService,
    private nativeGeocoder: NativeGeocoder,
    private inapp: InAppBrowser,
    private http: HttpClient
  ) {
    localStorage.removeItem("qty");
    localStorage.removeItem("prices");
    localStorage.removeItem("price");
    localStorage.removeItem("tax");
    localStorage.removeItem("tax_data");
    this.lat = localStorage.getItem("curentLat");
    this.lang = localStorage.getItem("curentLang");
    this.getData();
    localStorage.setItem("isLoginFirst", "true")
  }


  ngOnInit() {
  this.getCategories();

  }

  getCategories(){

    this.categories = [
      {
        id:1,
        label:'All',
        image: 'assets/images/icon.png',
        active: true,
      },
      {
        id:2,
        label:'Profile',
        image: 'assets/images/icon.png',
        active: false,
      },
      {
        id:3,
        label:'Event',
        image: 'assets/images/icon.png',
        active: false,
      },
      {
        id:4,
        label:'User',
        image: 'assets/images/icon.png',
        active: false,
      },
    ];

  }
  ionViewWillEnter() {
    this.getData();
  }

  getData(): void {
    this.lat = localStorage.getItem("curentLat");
    this.lang = localStorage.getItem("curentLang");
    this.address = JSON.parse(localStorage.getItem("selectedAddress"));
    console.log("this.address", this.address);

    this.api.profileUpdate.subscribe((d) => {
      const latCoordinates = {
        lat: this.lat,
        lang: this.lang,
      }
      this.api.postDataWithToken("events", latCoordinates).subscribe((success: any) => {
        this.util.dismissLoading();
        if (success.success) {
          this.event = success.data;
          console.log("event", this.event);
        }
      }, (err: any) => {
        this.util.dismissLoading();
      })
    })
  }

  public handleAddressChange(address: Address) {
    if (this.isFrom == 'search') {
      this.util.modal.dismiss(address);
    } else {
      this.local = JSON.parse(localStorage.getItem("dataOfAddress")) ? JSON.parse(localStorage.getItem("dataOfAddress")) : [];
      this.latitude = address.geometry.location.lat();
      this.longitude = address.geometry.location.lng();
      this.getGeoencoder(this.latitude, this.longitude);
      localStorage.setItem("curentLat", JSON.stringify(this.latitude));
      localStorage.setItem("curentLang", JSON.stringify(this.longitude));
      localStorage.setItem("lat", JSON.stringify(this.latitude));
      localStorage.setItem("lang", JSON.stringify(this.longitude));
      let dataOfAddress = {
        name: address.name,
        address: address.formatted_address,
        lat: address.geometry.location.lat(),
        lang: address.geometry.location.lng()
      };
      console.log('addressOfSelect', dataOfAddress);
      localStorage.setItem("selectedAddress", JSON.stringify(dataOfAddress.name));
      this.local.push(dataOfAddress);
      setTimeout(() => {
        this.ngOnInit();
      }, 500);
      localStorage.setItem("dataOfAddress", JSON.stringify(this.local))
      localStorage.setItem("addressOfLast", dataOfAddress.address);
      localStorage.setItem("lat", JSON.stringify(this.latitude));
      localStorage.setItem("lang", JSON.stringify(this.longitude));
    }
  }

  geoencoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5,
  };

  getGeoencoder(latitude, longitude) {
    this.nativeGeocoder
      .reverseGeocode(latitude, longitude, this.geoencoderOptions)
      .then((result: NativeGeocoderResult[]) => {
        this.address = this.generateAddress(result[0]);
        localStorage.setItem("addressOfLast", this.address);
        localStorage.setItem("gene", this.address);
      })
      .catch((error: any) => { });
  }

  generateAddress(addressObj) {
    let obj = [];
    let address = "";
    for (let key in addressObj) {
      obj.push(addressObj[key]);
    }
    obj.reverse();
    for (let val in obj) {
      if (obj[val].length) address += obj[val] + ", ";
    }
    return address.slice(0, -2);
  }

  like(id) {
    let tData: any;
    this.util.translate.get("ticketToast").subscribe((d) => {
      tData = d;
    })
    let token = localStorage.getItem("token") ? localStorage.getItem("token") : "";
    if (token == "") {
      this.util.presentToast(tData.notLogin);
    } else {
      this.util.presentLoading();
      this.api.postDataWithToken("add-favorite", { event_id: id }).subscribe((success: any) => {
        this.util.dismissLoading();
        if (success.success) {
          this.getData();
        }
      }, err => {
        this.util.dismissLoading();
      })
    }
  }

  async socialSharing(item) {
    this.api.sharing = item;
    console.log("item", item);
    const modal = await this.util.modal.create({
      component: SocialSharingPage,
      cssClass: "social-sharing",
    });
    return await modal.present();
  }

  getUsersList(event) {
    if (event) {
      this.lat = localStorage.getItem("curentLat");
      this.lang = localStorage.getItem("curentLang");
      this.address = JSON.parse(localStorage.getItem("selectedAddress"));
      this.getData();
      event.target.complete();
    }
  }

  goTicket() {
    this.navCtrl.navigateForward('ticket');
  }

  goList(id) {
    this.navCtrl.navigateForward("ticket");
    localStorage.setItem("id", id);
  }

  likes: any = [];

}
