import { Component, QueryList, ViewChildren } from '@angular/core';
import { Platform, NavController, IonRouterOutlet, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { Router } from '@angular/router';
import { ApiService } from './services/api.service';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  navigate: any;
  address: any;
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;
  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private navCtrl: NavController,
    private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation,
    private locationAccuracy: LocationAccuracy,
    private oneSignal: OneSignal,
    private router: Router,
    private toastController: ToastController,
    private api: ApiService,
    private nativeGeocoder: NativeGeocoder,
    private translate: TranslateService
  ) {
    localStorage.removeItem("qty");
    localStorage.removeItem("prices");
    localStorage.removeItem("price");
    localStorage.removeItem("tax");
    localStorage.removeItem("tax_data");
    console.log = function () { };
    this.locationCoords = {
      latitude: "",
      longitude: "",
      accuracy: "",
      timestamp: "",
    };

    if (localStorage.getItem("lan")) {
      this.translate.setDefaultLang(localStorage.getItem("lan"));
      if (localStorage.getItem('lan') == "ar") {
        document.documentElement.dir = "rtl";
      }
      if (localStorage.getItem('lan') == "en") {
        document.documentElement.dir = "ltr";
      }
    } else {
      this.translate.setDefaultLang("en");
      localStorage.setItem("lan", "en");
      document.documentElement.dir = "ltr";
    }
    this.initializeApp();
    setTimeout(() => {
      this.checkGPSPermission();
    }, 5000);
    let check = localStorage.getItem("isLoginFirst") ? localStorage.getItem("isLoginFirst") : "";
    if (check == "") {
      this.navCtrl.navigateRoot("pickcity");
    } else {
      this.navCtrl.navigateRoot("tabs/tab1");
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
        let data = {
          name: this.generateAddress(result[0].locality)
        }
        this.address = this.generateAddress(result[0].locality);
        localStorage.setItem("addressOfLast", result[0].locality);
        localStorage.setItem("selectedAddress", JSON.stringify(result[0].locality))
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


  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.statusBar.backgroundColorByHexString("#FEC009");
      this.backButtonEvent();
      localStorage.removeItem("qty");
      localStorage.removeItem("prices");
      localStorage.removeItem("price");
      localStorage.removeItem("tax");
      localStorage.removeItem("tax_data");
    });


    setTimeout(() => {
      this.api.getData("setting").subscribe(
        (res: any) => {
          console.log("key", res);
          if (res.success) {
            localStorage.setItem("currency_symbol", res.data.currency_symbol);
            localStorage.setItem("currency", res.data.currency);

            if (this.platform.is("cordova")) {
              this.oneSignal.startInit(
                res.data.onesignal_app_id,
                res.data.onesignal_project_number
              );
              this.oneSignal
                .getIds()
                .then((ids) => (this.api.deviceToken = ids.userId));
              console.log(
                "one signal",
                this.oneSignal
                  .getIds()
                  .then((ids) => (this.api.deviceToken = ids.userId))
              );
              this.oneSignal.endInit();
            } else {
              this.api.deviceToken = null;
            }
          }
        },
        (err) => { }
      );
    }, 2000);
  }


  async showToast() {
    const toast = await this.toastController.create({
      message: "Press back to exit app",
      duration: 2000,
      cssClass: "my-toast",
    });
    toast.present();
  }

  backButtonEvent() {
    this.platform.backButton.subscribe(() => {
      if (window.location.pathname == "/tabs/tab1") {
        navigator["app"].exitApp();
      }
      if (window.location.pathname == "/signin") {
        navigator["app"].exitApp();
      }
      if (window.location.pathname == "/tabs/tab2") {
        navigator["app"].exitApp();
      }
      if (window.location.pathname == "/tabs/tab3") {
        navigator["app"].exitApp();
      }
      if (window.location.pathname == "/tabs/tab4") {
        navigator["app"].exitApp();
      }
      if (window.location.pathname == "/tabs/tab5") {
        navigator["app"].exitApp();
      }
    });
  }

  exitApp() {
    localStorage.removeItem("qty");
    localStorage.removeItem("prices");
    localStorage.removeItem("price");
    localStorage.removeItem("tax");
    localStorage.removeItem("tax_data");
    this.api.discount = 0;
  }

  checkGPSPermission() {
    this.androidPermissions
      .checkPermission(
        this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
      )
      .then(
        (result) => {
          if (result.hasPermission) {
            //If having permission show 'Turn On GPS' dialogue
            this.askToTurnOnGPS();
          } else {
            //If not having permission ask for permission
            this.requestGPSPermission();
          }
        },
        (err: any) => {
          //alert(err);
          console.log("err", err);
        }
      );
  }

  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        console.log("4");
      } else {
        //Show 'GPS Permission Request' dialogue
        this.androidPermissions
          .requestPermission(
            this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
          )
          .then(
            () => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            (error: any) => {
              //Show alert if user click on 'No Thanks'
              console.log("requestPermission Error requesting location permissions", error);
            }
          );
      }
    });
  }

  askToTurnOnGPS() {
    this.locationAccuracy
      .request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
      .then(
        () => {
          // When GPS Turned ON call method to get Accurate location coordinates
          this.getLocationCoordinates();
        },
        (error: any) => {
          console.log("Error requesting location permissions " + JSON.stringify(error));
        }
      );
  }
  locationCoords: any;

  getLocationCoordinates() {
    this.geolocation
      .getCurrentPosition()
      .then((resp) => {
        this.locationCoords.latitude = resp.coords.latitude;
        this.locationCoords.longitude = resp.coords.longitude;
        this.locationCoords.accuracy = resp.coords.accuracy;
        this.locationCoords.timestamp = resp.timestamp;
        console.log(resp);

        localStorage.setItem(
          "curentLat",
          JSON.stringify(this.locationCoords.latitude)
        );
        localStorage.setItem(
          "curentLang",
          JSON.stringify(this.locationCoords.longitude)
        );
        localStorage.setItem("lat", JSON.stringify(this.locationCoords.latitude));
        localStorage.setItem("lang", JSON.stringify(this.locationCoords.longitude));
        this.getGeoencoder(this.locationCoords.latitude, this.locationCoords.longitude);
      })
      .catch((error) => {
        console.log("Error getting location" + error);
      });
  }

}
