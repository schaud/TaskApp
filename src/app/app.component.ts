import { Component, OnInit, OnDestroy } from '@angular/core';
import {AuthorizationService} from './services/authorization.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent implements OnInit, OnDestroy{
  title = 'Status Update';

  constructor(private auth: AuthorizationService, private router: Router) { }


  ngOnInit() {
      this.timer = setInterval(() => {this.time = new Date();}, 1000);
      this.auth.sharedUser.subscribe(user => this.user = user);
      this.auth.sharedLoggedIn.subscribe(loggedIn => this.loggedIn = loggedIn);

  }

  time = new Date();
  timer;
  user: string = '';
  loggedIn: boolean;


  logout(){
    window.location.href = 'login';
  }

  logout2(){
    this.auth.logOut();
    localStorage.clear();
    this.user = '';
    this.loggedIn = false;
    this.auth.sendState(this.loggedIn);
    this.router.navigateByUrl('');
  }



  ngOnDestroy(){
    clearInterval(this.timer);
  }

}





