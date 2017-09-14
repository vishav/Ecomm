import { Component, OnInit } from '@angular/core';

import { PaymentService } from '../../services/payment.service';
import { Pricing } from "../../models/Pricing";
import { Observable } from "rxjs/Observable";

@Component({
  moduleId: module.id,
  selector: 'app-pricing',
  templateUrl: 'pricing.component.html'
})
export class PricingComponent implements OnInit {
  pricing: Promise<Pricing>;
  countryPrice: number;

  constructor(private paymentservice: PaymentService) {
    this.pricing = this.paymentservice.getPricings();
  }

  ngOnInit() {
  }

}
