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
  }

  time = new Date();
  timer;


  logout(){
    window.location.href = 'login';
  }

  logout2(){
    this.auth.logOut();
    localStorage.clear();
    this.router.navigateByUrl('login');
  }



  ngOnDestroy(){
    clearInterval(this.timer);
  }

}





