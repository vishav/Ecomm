import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs';
import { SearchQuery } from '../models/SearchQuery';
import { OrderService } from './order.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class PaymentService {
  paymentid: string;
  cart: SearchQuery[];

  constructor(private http: Http,
              private orderservice: OrderService,
              private authservice: AuthenticationService,
              private router: Router) {
  }

  createpayment(data) {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    const options = new RequestOptions({headers: headers});
    this.http.post('/api/create', JSON.stringify({
      expmon: data.expire_month,
      expyear: data.expire_year,
      fname: data.first_name,
      lname: data.last_name,
      method: data.method,
      cnum: data.number,
      total: data.total,
      type: data.type,
      cvv2: data.cvv2
    }), options)
      .map(res =>
        res.json()
      ).catch((error, caught) => {
      if (error.status === 400) {
        console.log(error);
      }
      return Observable.throw(error);
    })
      .subscribe(
        result => {
          if (!result.success) {
            this.router.navigate(['/failure'])
          }else if (result.success || result.transaction.status == 'submitted_for_settlement') {
            this.paymentid = result.transaction.id;
            this.orderservice.pushtoorders(this.paymentid, data.total);
            this.router.navigate(['/success'])
          }
        }, error => {
          console.log(error);
          this.router.navigate(['/failure'])
        });
  }

  getPaymentDetails(paymentid) {
    console.log(paymentid);
    return this.http.get('/api/payment/' + paymentid).map(res => res.json());
  }

  getPricing() {
    const headers = new Headers({'Accept': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.get('/api/pricing/', options)
      .map(res => res.json());
  }

  savePricing(data) {
    const headers = new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'});
    headers.append('Authorization', 'Bearer ' + this.authservice.getToken());
    const options = new RequestOptions({headers: headers});

    const parameters = {countryPrice: data.countryPrice, statePrice: data.statePrice, cityPrice: data.cityPrice, minPrice: data.minPrice};
    return this.http.post('/api/savepricing', JSON.stringify({parameters: parameters}), options)
      .map(res => {
        if(res.status !== 200){
          throw new Error('This request has failed ' + res.status);
        }else {
          return res.json()
        }
      });
  }
}
