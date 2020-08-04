import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent implements OnInit, OnDestroy{
  title = 'Status Update';

  ngOnInit() {
      this.timer = setInterval(() => {this.time = new Date();}, 1000);
  }

  time = new Date();
  timer;


  logout(){
    window.location.href = 'login';
  }

  ngOnDestroy(){
    clearInterval(this.timer);
  }

}





