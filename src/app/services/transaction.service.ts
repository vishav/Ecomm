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
    return this.http.get('/api/transactions/' + data.country + '/' + data.state + '/' + data.city + '/' + data.fromDate + '/' + data.toDate, options)
      .map(res => res.json());
  }
}
