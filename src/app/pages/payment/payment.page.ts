
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ICreateOrderRequest, IPayPalConfig } from 'ngx-paypal';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowser, InAppBrowserObject } from '@ionic-native/in-app-browser/ngx';
declare var RazorpayCheckout: any;
declare var StripeCheckout;
@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {
  qty: any = 1;
  totalPrice: any = 0;
  avai: string;
  data: any;
  dataTrue: boolean = true;
  setting: any;
  stripeData = {
    number: "",
    expMonth: 0,
    expYear: 0,
    cvc: "",
  };
  tdata: any;
  razor: any;
  public payPalConfig?: IPayPalConfig;
  public buttonIcon = "../../../assets/icon/icon.svg";
  currency: string;
  isnum: boolean;
  handler: any;
  totaltax: any;
  total: number;
  href: any;

  constructor(private api: ApiService,
    private util: UtilService,
    private nav: NavController,
    public inapp: InAppBrowser,
    private translate: TranslateService,
  ) {

    this.api.getData("setting").subscribe((success: any) => {
      if (success.success) {
        this.setting = success.data;
      }
    }, err => {
      console.log(err)
    })
    setTimeout(() => {
      this.handler = StripeCheckout.configure({
        key: this.setting.stripePublicKey,
        currency: this.setting.currency,
        color: "#3ea8e5",
        image: "../../../assets/images/logo.png", // Picture you want to show in pop up
        locale: "auto",
        token: (token) => {
          console.log("token", token);
          this.paywithstripe(token.id);
        },
      });
    }, 1000);
  }


  ngOnInit() { }

  ionViewWillEnter() {
    this.translate.get("paymentToast").subscribe((d) => {
      this.tdata = d;
    })
    this.currency = localStorage.getItem("currency_symbol");
    this.totalPrice = this.api.ticket_Final_total;
    this.avai = localStorage.getItem("ticketAvailable");
    this.totaltax = JSON.parse(localStorage.getItem("tax"));
    this.api.getData("setting").subscribe((success: any) => {
      if (success.success) {
        this.setting = success.data;
      }
    }, err => {
      console.log(err)
    })
  }

  select: any = "Cash On Delivery";

  payment_divP: any = [
    {
      name: "Paypal",
      img: "../../../assets/payment/paypal.png",
    },
  ];

  payment_divR: any = [
    {
      name: "Razorpay",
      img: "../../../assets/payment/razor.png",
    },
  ];

  payment_divS: any = [
    {
      name: "Stripe",
      img: "../../../assets/payment/stripe.png",
    },
  ];

  payment_divC: any = [
    {
      img: "../../../assets/payment/payment-method.svg",
      name: "Cash On Delivery",
    },
  ];

  payment_divF: any = [
    {
      img: "../../../assets/share/flutterwave.png",
      name: "Flutterwave"
    },
  ];

  payWithRazor() {

    var options = {
      description: "Credits towards consultation",
      image: "https://i.imgur.com/3g7nmJC.png",
      currency: this.setting.currency,
      key: this.setting.razorPublishKey,
      amount: this.totalPrice * 100,
      name: "User",
      theme: {
        color: "#2C69A5",
      },
      modal: {
        ondismiss: function () {
          alert("dismissed");
        },
      },
    };

    var successCallback = function (payment_id: any) {
      localStorage.setItem("paymentRazor", payment_id);
      this.util.presentLoading();
      const fd = new FormData();
      fd.append("event_id", localStorage.getItem("id"));
      fd.append("coupon_id", this.api.coupon_id ? this.api.coupon_id : "")
      fd.append("ticket_id", localStorage.getItem("ticket_id"));
      fd.append("quantity", localStorage.getItem("qty"));
      fd.append("coupon_discount", this.api.discount);
      fd.append("payment", this.totalPrice);
      fd.append("tax", localStorage.getItem("tax"))
      fd.append("payment_type", "RAZOR");
      fd.append("payment_token", payment_id);;
      fd.append("tax_data", localStorage.getItem("tax_data"));
      this.api.postDataWithToken("create-order", fd).subscribe((success: any) => {
        if (success.success) {
          localStorage.removeItem("qty");
          localStorage.removeItem("prices");
          localStorage.removeItem("price");
          localStorage.removeItem("tax");
          localStorage.removeItem("tax_data");
          this.api.discount = 0;
          this.nav.navigateForward("tabs/tab1")
          this.util.presentToast(this.tdata.completed);
          this.util.dismissLoading();
        }
      }, err => {
        console.log(err)
        this.util.dismissLoading();
      })

    };

    var cancelCallback = (error) => {
      this.util.presentToast(this.tdata.sry);
    };

    RazorpayCheckout.open(options, successCallback, cancelCallback);

  }

  paypal: any = false;

  item(item) {
    this.select = item;

    if (this.select == "Paypal") {
      if (this.setting.paypal == 1) {
        this.initConfig(this.totalPrice, "User");
        this.paypal = true
      } else {
        this.util.presentToast(this.tdata.notPossible);
        this.paypal = false;
      }
    } else if (this.select == "Razorpay") {
      this.dataTrue = true;
      this.paypal = false;
    } else if (this.select == "Stripe") {
      this.dataTrue = true;
      this.paypal = false;
      this.stripeSetup();
    } else {
      this.dataTrue = true;
      this.paypal = false;
    }
  }

  checkbtn: any = false;

  cashPay() {
    this.util.presentLoading();
    const fd = new FormData();
    fd.append("event_id", localStorage.getItem("id"));
    fd.append("coupon_id", this.api.coupon_id ? this.api.coupon_id : "")
    fd.append("ticket_id", localStorage.getItem("ticket_id"));
    fd.append("quantity", localStorage.getItem("qty"));
    fd.append("coupon_discount", this.api.discount);
    fd.append("payment", this.totalPrice);
    fd.append("payment_type", "LOCAL");
    fd.append("tax", localStorage.getItem("tax"));
    fd.append("tax_data", localStorage.getItem("tax_data"));
    this.api.postDataWithToken("create-order", fd).subscribe((success: any) => {
      if (success.success) {
        localStorage.removeItem("qty");
        localStorage.removeItem("prices");
        localStorage.removeItem("price");
        localStorage.removeItem("tax");
        localStorage.removeItem("tax_data");
        this.api.discount = 0;
        this.nav.navigateForward("tabs/tab1")
        this.util.presentToast(this.tdata.completed);
        this.util.dismissLoading();

      }
    }, err => {
      console.log(err)
      this.util.dismissLoading();
    })
  }

  flutterWave() {
    this.util.presentLoading();
    const fd = new FormData();
    fd.append("event_id", localStorage.getItem("id"));
    fd.append("coupon_id", this.api.coupon_id ? this.api.coupon_id : "")
    fd.append("ticket_id", localStorage.getItem("ticket_id"));
    fd.append("quantity", localStorage.getItem("qty"));
    fd.append("coupon_discount", this.api.discount);
    fd.append("payment", this.totalPrice);
    fd.append("payment_type", "FLUTTERWAVE");
    fd.append("tax", localStorage.getItem("tax"));
    fd.append("tax_data", localStorage.getItem("tax_data"));
    this.api.postDataWithToken("create-order", fd).subscribe((success: any) => {
      this.util.dismissLoading();
      if (success.success) {
        console.log(success.data);
        localStorage.removeItem("qty");
        localStorage.removeItem("prices");
        localStorage.removeItem("price");
        localStorage.removeItem("tax");
        localStorage.removeItem("tax_data");
        this.api.discount = 0;
        this.openInApp(success.data.redirect_url);
      }
    }, err => {
      console.log("flutter", err)
      this.util.dismissLoading();
    })
  }

  openInApp(url) {
    console.log('funciton call')
    const browser = this.inapp.create(url);
    browser.on('loadstop').subscribe(event => {
      console.log('load stop ', event)
      console.log('string search ', event.url.search('status=successful'))
      if (event.url.search('status=successful') > 1) {
        console.log('success true');
        browser.close();
        this.nav.navigateRoot("tabs/tab3");
      }
    });

    browser.on("exit").subscribe((e: any) => {
      console.log("on exist ", e);
      let location = window.location.href;

      var parts = e.url.split("/");
      console.log(parts);
      browser.close();
    });
  }

  private initConfig(price, name): void {
    this.payPalConfig = {
      currency: this.setting.currency,
      clientId: this.setting.paypalClientId,
      createOrderOnClient: (data) =>
        <ICreateOrderRequest>{
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: this.setting.currency,
                value: price,
                breakdown: {
                  item_total: {
                    currency_code: this.setting.currency,
                    value: price,
                  },
                },
              },
              items: [
                {
                  name,
                  quantity: "1",
                  category: "DIGITAL_GOODS",
                  unit_amount: {
                    currency_code: this.setting.currency,
                    value: price,
                  },
                },
              ],
            },
          ],
        },
      advanced: {
        commit: "true",
      },
      style: {
        label: "paypal",
        layout: "vertical",
      },
      onApprove: (data, actions) => {
        console.log(
          "onApprove - transaction was approved, but not authorized",
          data,
          actions
        );
        actions.order.get().then((details) => {
          console.log(
            "onApprove - you can get full order details inside onApprove: ",
            details
          );
        });
      },
      onClientAuthorization: (data) => {
        console.log(
          "onClientAuthorization - you should probably inform your server about completed transaction at this point",
          data
        );
        this.util.presentToast(this.tdata.completed)
        console.log('payment token', data.id);
        this.util.presentLoading();
        const fd = new FormData();
        fd.append("event_id", localStorage.getItem("id"));
        fd.append("coupon_id", this.api.coupon_id ? this.api.coupon_id : "")
        fd.append("ticket_id", localStorage.getItem("ticket_id"));
        fd.append("quantity", localStorage.getItem("qty"));
        fd.append("coupon_discount", this.api.discount);
        fd.append("payment", this.totalPrice);
        fd.append("payment_type", "PAYPAL");
        fd.append("tax", localStorage.getItem("tax"))
        fd.append("payment_token", data.id);;
        fd.append("tax_data", localStorage.getItem("tax_data"));
        this.api.postDataWithToken("create-order", fd).subscribe((success: any) => {
          if (success.success) {
            localStorage.removeItem("qty");
            localStorage.removeItem("prices");
            localStorage.removeItem("price");
            localStorage.removeItem("tax");
            localStorage.removeItem("tax_data");
            this.api.discount = 0;
            this.nav.navigateForward("tabs/tab1")
            this.util.presentToast(this.tdata.completed);
            this.util.dismissLoading();
          }
        }, err => {
          console.log(err)
          this.util.dismissLoading();
        })
      },
      onCancel: (data, actions) => {
        console.log("OnCancel", data, actions);
        this.util.presentToast(this.tdata.canceled)
      },
      onError: (err) => {
        console.log("OnError", err);
      },
      onClick: (data, actions) => {
        console.log("onClick", data, actions);
      },
    };
  }

  paywithstripe(id: any) {
    this.util.presentLoading();
    this.checkbtn = true;
    const fd = new FormData();
    fd.append("event_id", localStorage.getItem("id"));
    fd.append("coupon_id", this.api.coupon_id ? this.api.coupon_id : "")
    fd.append("ticket_id", localStorage.getItem("ticket_id"));
    fd.append("quantity", localStorage.getItem("qty"));
    fd.append("coupon_discount", this.api.discount);
    fd.append("payment", this.totalPrice);
    fd.append("payment_type", "STRIPE");
    fd.append("tax", localStorage.getItem("tax"));
    fd.append("payment_token", id);
    fd.append("tax_data", localStorage.getItem("tax_data"));
    this.api.postDataWithToken("create-order", fd).subscribe((success: any) => {
      if (success.success) {
        localStorage.removeItem("qty");
        localStorage.removeItem("prices");
        localStorage.removeItem("price");
        localStorage.removeItem("tax");
        localStorage.removeItem("tax_data");
        this.api.discount = 0;
        this.nav.navigateForward("tabs/tab1")
        this.util.presentToast(this.tdata.completed);
        this.util.dismissLoading();
      }
    }, err => {
      console.log(err)
      this.util.dismissLoading();
    })
  }

  done() {
    if (this.select == 'Cash On Delivery') {
      this.cashPay();
    } else if (this.select == 'Paypal') {
      if (this.setting.paypal == 1) {
      } else {
        this.util.presentToast(this.tdata.notPossible)
      }
    } else if (this.select == 'Stripe') {
      if (this.setting.stripe == 1) {
        this.stripeSetup();
      } else {
        this.util.presentToast(this.tdata.notPossible)
      }
    } else if (this.select == 'Razorpay') {
      if (this.setting.razor == 1) {
        this.payWithRazor();
      } else {
        this.util.presentToast(this.tdata.notPossible)
      }
    }
    else if (this.select == 'Flutterwave') {
      if (this.setting.flutterwave == 1) {
        this.flutterWave();
      } else {
        this.util.presentToast(this.tdata.notPossible)
      }
    }
  }

  stripeSetup() {
    if (this.setting.currency == "EUI" || this.setting.currency == "USD") {
      this.handler.open({
        name: "EventRight", // Pass your application name
        image: "https://i.imgur.com/3g7nmJC.png",
        amount: this.totalPrice * 100, // Pass your billing amount
      });
    } else {
      this.handler.open({
        name: "EventRight", // Pass your application name
        image: "https://i.imgur.com/3g7nmJC.png",
        amount: this.totalPrice, // Pass your billing amount
      });
    }

  }

  ionViewWillLeave() {
    localStorage.removeItem("tax");
  }

  back() {
    localStorage.removeItem("tax");
    this.nav.navigateForward("/ticketdetails2")
  }
} 
