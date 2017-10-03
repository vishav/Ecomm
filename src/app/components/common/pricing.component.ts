import { Component, OnInit } from '@angular/core';

import { PaymentService } from '../../services/payment.service';
import { Pricing } from '../../models/Pricing';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  moduleId: module.id,
  selector: 'app-pricing',
  templateUrl: 'pricing.component.html'
})
export class PricingComponent implements OnInit {
  pricing: any;
  errorMessage: string;
  role: string;
  isloggedin: boolean;
  currentUser: any;
  loading = false;
  successmessage: string = null;
  failuremessage: string = null;

  constructor(private authenticationService: AuthenticationService,
              private paymentservice: PaymentService) {
    this.isloggedin = authenticationService.isLoggedIn()
    if (this.isloggedin) {
      const curuser: any = authenticationService.currentUser();
      if (curuser !== false) {
        this.currentUser = curuser;
        if (this.currentUser != null) {
          this.role = this.currentUser.role;
        } else {
          this.role = 'customer';
        }
      }
    }

    this.paymentservice.getPricing().subscribe(pricing => {
        console.log(pricing);
        this.pricing = pricing;
      },
      error => {
        this.errorMessage = <any>error;
        console.log('error:', this.errorMessage);
      }
    );
  }

  ngOnInit() {
  }

  savePricing(){
    this.loading = true;
    const data = {
      countryPrice: this.pricing.countryPrice,
      statePrice: this.pricing.statePrice,
      cityPrice: this.pricing.cityPrice,
      minPrice: this.pricing.minPrice
    };

    this.successmessage = null;
    this.failuremessage = null;

    this.paymentservice.savePricing(data).subscribe((result) => {
        console.log(result);
        this.successmessage = 'Successfully saved pricing.';
        this.loading = false;
      },
      (err) => {
        this.failuremessage = 'Some error occurred while saving. Please try again.'
        this.loading = false;
      },
    );

  }
}
