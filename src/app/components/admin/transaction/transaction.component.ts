import { Component, Input, OnChanges } from '@angular/core';
import { TransactionService } from '../../../services/transaction.service';
import { AuthenticationService } from '../../../services/authentication.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnChanges {
  @Input() country: any;
  @Input() state: any;
  @Input() city: any;
  @Input() fromDate: any = null;
  @Input() toDate: any = null;
  @Input() model: any = {};
  errorMessage: string;
  transactions: any = [];
  role: string;
  currentUser: any;
  notloggederrormessage = 'To view this page, you must login first.';
  unautherrormessage = 'You are not authorized to view this page';
  norecordfoundsmessage = 'No records found.';
  isloggedin: boolean;
  index: any = null;

  constructor(private authenticationService: AuthenticationService,
              private transactionservice: TransactionService) {
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
  }

  ngOnChanges() {
    const data = {
      country: this.country,
      state: this.state,
      city: this.city,
      fromDate: this.fromDate,
      toDate: this.toDate,
      model: this.model
    };
    this.transactionservice.getTransactions(data)
      .subscribe(transactions => {
          console.log(transactions);
          this.transactions = transactions;
        },
        error => {
          this.errorMessage = <any>error;
          console.log('error:', this.errorMessage);
        }
      );
  }

  setindex(index) {
    this.index = index;
  }

/*  downloadTransactions() {
    this.transactionservice.downloadTransactions()
      .subscribe(transactions => {
          console.log(transactions);
          this.transactions = transactions;
        },
        error => {
          this.errorMessage = <any>error;
          console.log('error:', this.errorMessage);
        }
      );
  }*/
}
