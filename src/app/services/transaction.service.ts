import { Injectable } from '@angular/core';

import { Http, RequestOptions, Headers } from '@angular/http';
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
}
