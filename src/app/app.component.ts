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
  }

  time = new Date();
  timer;
  user: string = '';


  logout(){
    window.location.href = 'login';
  }

  logout2(){
    this.auth.logOut();
    localStorage.clear();
    this.user = '';
    this.router.navigateByUrl('');
  }



  ngOnDestroy(){
    clearInterval(this.timer);
  }

}





