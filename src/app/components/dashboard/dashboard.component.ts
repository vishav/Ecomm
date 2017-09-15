import { Component, OnInit, Input } from '@angular/core';
import { HselectionService } from '../../services/hselection.service'
import { ShoppingcartService } from '../../services/shoppingcart.service'
import { Router } from '@angular/router'
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { Global } from '../common/global';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private myFromDateOptions: IMyDpOptions = {
    height: '34px',
    width: '210px',
    disableSince: {year: 0, month: 0, day: 0},
    alignSelectorRight: false,
    openSelectorTopOfInput: false,
    indicateInvalidDate: true,
    monthSelector: true,
    yearSelector: true,
    dateFormat: 'mm/dd/yyyy'
  };
  private myToDateOptions: IMyDpOptions = {
    height: '34px',
    width: '210px',
    disableUntil: {year: 0, month: 0, day: 0},
    alignSelectorRight: false,
    openSelectorTopOfInput: false,
    indicateInvalidDate: true,
    monthSelector: true,
    yearSelector: true,
    dateFormat: 'mm/dd/yyyy'
  };
  years: number[] = [];
  selectedcountry = 'Country';
  selectedstate = 'State';
  selectedcity = 'City';
  country: string;
  state: string;
  city: string;
  fromdateplaceholder = 'From Date (MM/DD/YYYY)';
  todateplaceholder = 'To Date (MM/DD/YYYY)';
  countries: any = [];
  states: any = [];
  cities: any = [];
  holidays: any = [];
  date: any;
  cartnumber: number;
  currentyear: number;
  showAdvDate = false;
  yearentry = false;
  yearselect: number;
  fromDate: any = null;
  toDate: any = null;
  submitenabled = false;
  role: string;
  currentUser: any;
  notloggederrormessage = 'To view this page, you must login first.';
  unautherrormessage = 'You are not authorized to view this page.';
  isloggedin: boolean;
  showtransactions = false;
  model: any = {};

  constructor(private authenticationService: AuthenticationService,
              private hselectionService: HselectionService,
              private router: Router) {
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
    if (this.country) {
      this.selectedcountry = this.country;
      this.submitenabled = true;
    }
    if (this.state) {
      this.selectedstate = this.state;
    }
    if (this.city) {
      this.selectedcity = this.city;
    }
    this.hselectionService.getAllCountries().subscribe(countries => {
      this.countries = countries.theList;
    });
    this.hselectionService.getYear().subscribe(year => {
      this.currentyear = year.year;
    });
    this.years = Global.getYears(0);
    this.fromDate = new Date(this.years[this.years.length - 1]);
    this.toDate = new Date();
  }

  countrySelect(country) {
    this.hselectionService.getStates(country).subscribe(states => {
      this.hselectionService.getCountryCites(country).subscribe(cities => {
        this.cities = cities.theList;
        this.states = states.theList;
        this.selectedcountry = country;
        this.selectedstate = 'State';
        this.selectedcity = 'City';
        this.submitenabled = true;
      });

    });
  }


  stateSelect(state) {
    this.hselectionService.getCities(state, this.selectedcountry).subscribe(cities => {
      this.cities = cities.theList;
      this.selectedstate = state;
    });
  }

  citySelect(city) {
    this.selectedcity = city;
  }


  showDate() {
    this.showAdvDate = !this.showAdvDate;
    this.yearselect = null;
    this.yearentry = !this.yearentry;
  }

  onFromDateChanged(event: IMyDateModel) {
    console.log(event.date);
    const toOptions = JSON.parse(JSON.stringify(this.myToDateOptions));
    toOptions.disableUntil = {year: event.date.year, month: event.date.month, day: event.date.day};
    this.myToDateOptions = toOptions;
    this.fromDate = new Date(event.jsdate);
  }

  onToDateChanged(event: IMyDateModel) {
    console.log(event.date);
    const fromOptions = JSON.parse(JSON.stringify(this.myFromDateOptions));
    fromOptions.disableSince = {year: event.date.year, month: event.date.month, day: event.date.day};
    this.myFromDateOptions = fromOptions;
    this.toDate = new Date(event.jsdate);
  }

  getTransactions() {
    this.showtransactions = true;
      if (this.yearselect) {
        this.fromDate = new Date(this.yearselect, 0, 1);
        this.toDate = new Date(this.yearselect, 11, 31);
      }
  }

  resetForm(){
    this.showtransactions = false;
  }
}
