import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {AuthorizationService} from '../../services/authorization.service';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit{


  time = new Date();
  timer;
  user: string = '';
  loggedIn: boolean;

  Stoday: boolean = true;
  Screate: boolean = false;
  Sname: boolean = false;
  Sdate: boolean = false;


  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver,
              private auth: AuthorizationService,
              private router: Router,
              private data: DataService) {
  }

  ngOnInit() {
    this.timer = setInterval(() => {this.time = new Date();}, 1000);
    this.auth.sharedUser.subscribe(user => this.user = user);
    this.auth.sharedLoggedIn.subscribe(loggedIn => this.loggedIn = loggedIn);

    this.data.sharedToday.subscribe(Stoday => this.Stoday = Stoday);
    this.data.sharedCreate.subscribe(Screate => this.Screate = Screate);
    this.data.sharedDate.subscribe(Sdate => this.Sdate = Sdate);
    this.data.sharedName.subscribe(Sname => this.Sname = Sname);
  }


  logout2(){
    this.auth.logOut();
    localStorage.clear();
    this.user = '';
    this.loggedIn = false;
    this.auth.sendState(this.loggedIn);
    this.router.navigateByUrl('');
  }

  showToday(){
    this.data.sendToday(true);
    this.data.sendCreate(false);
    this.data.sendDate(false);
    this.data.sendName(false);
    console.log(this.Stoday)
  }

  showName(){
    this.data.sendToday(false);
    this.data.sendCreate(false);
    this.data.sendDate(false);
    this.data.sendName(true);
    console.log(this.Stoday)
  }

  showDate(){
    this.data.sendToday(false);
    this.data.sendCreate(false);
    this.data.sendDate(true);
    this.data.sendName(false);
    console.log(this.Stoday)
  }

  showCreate(){
    this.data.sendToday(false);
    this.data.sendCreate(true);
    this.data.sendDate(false);
    this.data.sendName(false);
    console.log(this.Stoday)
  }





  ngOnDestroy(){
    clearInterval(this.timer);
  }

}





