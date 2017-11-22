import { Injectable } from '@angular/core';

import { Http, RequestOptions, Headers, ResponseContentType } from '@angular/http';
import { AuthenticationService } from './authentication.service';
import 'rxjs/add/operator/map';

@Injectable()
export class TransactionService {

  constructor(private http: Http, private authentication: AuthenticationService) { }

  getTransactions(data) {
    const headers = new Headers({'Accept': 'application/json'});
    headers.append('Authorization', 'Bearer ' + this.authentication.getToken());
    const options = new RequestOptions({headers: headers});
    const model = (JSON.stringify(data.model));
    const parameter = data.country + '/' + data.state + '/' + data.city + '/' + model + '/' + data.fromDate + '/' + data.toDate;
    return this.http.get('/api/transactions/' + parameter, options).map(res => res.json());
  }

  downloadTransactions(data){
    const headers = new Headers({'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    headers.append('Authorization', 'Bearer ' + this.authentication.getToken());
    const options = new RequestOptions({headers: headers, responseType: ResponseContentType.Blob});
    const model = (JSON.stringify(data.model));
    const parameter = data.country + '/' + data.state + '/' + data.city + '/' + model + '/' + data.fromDate + '/' + data.toDate;
    return this.http.get('/api/download/' + parameter, options);
  }

  refundTransaction(data) {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    headers.append('Authorization', 'Bearer ' + this.authentication.getToken());
    const options = new RequestOptions({headers: headers});
    return this.http.post('/api/refund', JSON.stringify({
      paymentid: data.paymentid,
      refundAmount: data.refundAmount
    }), options)
      .map(res =>
        res.json()
      );
  }
}
