import { Component, Input, OnInit } from '@angular/core';
import { TransactionService } from '../../../services/transaction.service';
import { AuthenticationService } from '../../../services/authentication.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  @Input() country: any;
  @Input() state: any;
  @Input() city: any;
  @Input() fromDate: any = null;
  @Input() toDate: any = null;
  fromyear: number;
  frommonth: number;
  fromday: number;
  toyear: number;
  tomonth: number;
  today: number;
  errorMessage: string;
  transactions: any = [];
  role: string;
  currentUser: any;
  notloggederrormessage = 'To view this page, you must login first.';
  unautherrormessage = 'You are not authorized to view this page';
  isloggedin: boolean;
  index: any =  null;

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

  ngOnInit() {
    if (this.fromDate) {
      this.fromyear = this.fromDate.getFullYear();
      this.frommonth = this.fromDate.getMonth() + 1;
      this.fromday = this.fromDate.getDate();
    }

    if (this.toDate) {
      this.toyear = this.toDate.getFullYear();
      this.tomonth = this.toDate.getMonth() + 1;
      this.today = this.toDate.getDate();
    }

    const data = {
      country: this.country,
      state: this.state,
      city: this.city,
      fromYear: this.fromyear,
      fromMonth: this.frommonth,
      fromDay: this.fromday,
      toYear: this.toyear,
      toMonth: this.tomonth,
      toDay: this.today
    };

    this.transactionservice.getTransactions(data)
      .subscribe(transactions => {
          console.log(transactions);
          this.transactions = transactions.theList;
        },
        error => {
          this.errorMessage = error.json().errormessage;
          console.log(this.errorMessage);

        });
  }

  setindex(index) {
    console.log(index);
    this.index = index;
  }
}
