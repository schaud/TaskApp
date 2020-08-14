import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private Stoday = new BehaviorSubject(true)
  private Sname = new BehaviorSubject(null)
  private Sdate = new BehaviorSubject(null)
  private Screate = new BehaviorSubject(null)
  sharedToday = this.Stoday.asObservable();
  sharedName = this.Sname.asObservable();
  sharedDate = this.Sdate.asObservable();
  sharedCreate = this.Screate.asObservable();

  constructor() { }


  sendCreate(Screate: boolean){
    this.Screate.next(Screate)
  }

  sendToday(Stoday: boolean){
    this.Stoday.next(Stoday)
  }

  sendDate(Sdate: boolean){
    this.Sdate.next(Sdate)
  }

  sendName(Sname: boolean){
    this.Sname.next(Sname)
  }
}


