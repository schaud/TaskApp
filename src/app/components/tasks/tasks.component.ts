import {Component, OnInit, HostListener} from '@angular/core';
import { ApiServiceService} from '../../services/api-service.service';
import * as moment from 'moment';
import {MatDialog} from '@angular/material/dialog';
import {SubtaskComponent} from '../dialog/subtask/subtask.component';
import {PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {AuthorizationService} from '../../services/authorization.service';
import {Observable} from 'rxjs';
import {DataService} from '../../services/data.service';



@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  Stoday: boolean;
  Screate: boolean;
  Sdate: boolean;
  Sname: boolean;

  scrHeight:any;
  scrWidth:any;

  constructor(private apiservice: ApiServiceService,
              public dialog: MatDialog,
              private auth: AuthorizationService,
              private data: DataService) {
    this.getScreenSize();
  }


  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrHeight = window.innerHeight;
    this.scrWidth = window.innerWidth;
    console.log(this.scrHeight, this.scrWidth);
  }



  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  currentItemsToShow: [];
  pageSize = 3; // number of cards per page


  ngOnInit(): void {
    this.restrictAccess();
    this.getTasksToday();
    this.getTasksByName(this.getNameFromEmail(this.currentUser));
    this.getCurrentDate();
    this.currentItemsToShow = this.subTasks.slice(0, this.pageSize);
    this.data.sharedToday.subscribe(Stoday => this.Stoday = Stoday);
    this.data.sharedCreate.subscribe(Screate => this.Screate = Screate);
    this.data.sharedDate.subscribe(Sdate => this.Sdate = Sdate);
    this.data.sharedName.subscribe(Sname => this.Sname = Sname);
    console.log('islogged?');
    console.log(this.auth.isLoggedIn());
    console.log(this.auth.getAuthenticatedUser())
  }

//Variables: General and Application State
  currentUser = localStorage.getItem('UserEmail');
  selectedTask: any = {id: "holder", userid: "holder", task: "holder", progress: "holder", taskdate: "YYYY-MM-DD"};
  momentDate = moment.utc().utcOffset(-5).format('YYYY-MM-DD');
  name: String;
  date: any;
  usernames: any;
  newTask: string;
  newProgress: string;
  newDetails: string;
  id: number;
  subTaskName: string;
  subTaskDetails: string;
  subTaskProgress: string;

//Variables : Boolean flags
  exists_today: boolean;
  exists_byDate: boolean;
  exists_byName: boolean;
  executed_date: boolean = false;
  executed_name: boolean = false;
  dontUpdate : boolean = false;
  expanded: boolean = false;
  showSpinner: boolean = false;
  showSpinnerName: boolean = false;
  showSpinnerDate: boolean = false;
  badPercent: boolean = false;
  complete: boolean = false;
  allowAccess: boolean;
  isAdmin: boolean = false;

// Variables: JSON Templates
  newTaskReport: any = {id: "holder", userid: "holder", task: "holder", progress: "holder", taskdate: "YYYY-MM-DD"};
  tasks: any = {id: "holder", userid: "holder", task: "holder", progress: "holder", taskdate: "YYYY-MM-DD"};
  tasksByDate: any = {id: "holder", userid: "holder", task: "holder", progress: "holder", taskdate: "YYYY-MM-DD"};
  tasksByName: any = {id: "holder", userid: "holder", task: "holder", progress: "holder", taskdate: "YYYY-MM-DD"};
  subTask: any = {id: "holder", subtask: "holder", details: "holder", taskid: "holder", date: "YYYY-MM-DD", progress: 'holder'};
  task: any = {id: "holder", userid: "holder", task: "holder", progress: "holder", taskdate: "YYYY-MM-DD"};
  subTasks: any = [
    {id: "holder", subtask: "holder", details: "holder", taskid: "holder", date: "YYYY-MM-DD", progress: 'holder'},
    {id: "holder", subtask: "holder", details: "holder", taskid: "holder", date: "YYYY-MM-DD", progress: 'holder'},
    {id: "holder", subtask: "holder", details: "holder", taskid: "holder", date: "YYYY-MM-DD", progress: 'holder'}
  ];

//Utility functions
  swapIdToName(taskList: any) {
    for (let task of taskList) {
      for (let employee of this.usernames) {
        if (task.userid == employee.id)
          task.userid = employee.name;
      }
    }
  }

  getIdFromName(username) {
    let result;
    for (let user of this.usernames) {
      if (user.name == username) {
        result = user.id;
      }
    }
    console.log('The ID is ' + result)
    return result;
  }

  getIdFromEmail(email) {
    let result;
    for (let user of this.usernames) {
      if (user.email == email) {
        result = user.id;
      }
    }
    console.log('The ID is ' + result)
    return result;
  }

  getNameFromEmail(email){
    let result;
    for (let user of this.usernames) {
      if (user.email == email) {
        result = user.name;
      }
    }
    console.log('daemail')

    console.log(this.currentUser)
    console.log('The name is ' + result)
    return result;
  }

  getCurrentDate() {
    let date = new Date;
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let month2 = month.toString();
    let day2 = day.toString();
    if (day < 10) {
      day2 = '0' + day;
    }
    if (month < 10) {
      month2 = '0' + month;
    }
    let fullDate = `${year}-${month2}-${day2}`;
    return fullDate;
  }

  sortData(array) {
    return array.sort((a, b) => {
      return <any> new Date(b.taskdate) - <any> new Date(a.taskdate);
    });
  }

  validate(percentage) {
    return percentage.match(/^(101(\.0{1,2})?|[1-9]?\d(\.\d{1,2})?%)$/) != null;
  }

  //API functions
  async getUsernames() {
    this.usernames = await this.apiservice.getAllUsers().then();
    console.log(this.usernames);
    return this.usernames;
  }

  async getTasksToday() {
    if (!this.dontUpdate) {
      await this.getUsernames();
      this.tasks = await this.apiservice.getTasksToday().then();
      this.swapIdToName(this.tasks)
      console.log(this.tasks)
      if (this.tasks.length === 0) {
        this.exists_today = false;
        console.log("No such Task ID exists")
      } else this.exists_today = true;
      console.log('Authenitcated User')
      console.log(this.currentUser)
      return this.tasks;
    }
    else return;
  }

  async submitTasks() {
    this.newTaskReport.taskdate = this.getCurrentDate();
    this.newTaskReport.id = '0';
    this.newTaskReport.userid = this.getIdFromEmail(this.currentUser);
    this.newTaskReport.details = this.newDetails;
    this.newTaskReport.task = this.newTask;
    this.newTaskReport.progress = this.newProgress;
    if (this.validate(this.newTaskReport.progress)){
      await this.apiservice.createTask(this.newTaskReport);
      console.log(this.newTaskReport)
    }

    else {
      this.badPercent = true;
      console.log('Invalid percentage')
    }
  }



  async getTasksByDate() {
    this.complete = false;
    this.showSpinnerDate = true;
    this.executed_date = true;
    await this.getUsernames();
    this.tasksByDate = await this.apiservice.getTasksByDate(this.date).then();
    this.swapIdToName(this.tasksByDate)
    console.log(this.tasksByDate)
    if (this.tasksByDate.length === 0) {
      this.exists_byDate = false;
      console.log("No such Task ID exists")
    } else this.exists_byDate = true;
    console.log(this.exists_byDate)
    this.showSpinnerDate = false;
    this.complete = true;
    return this.tasksByDate;
  }

  async getTasksByName(name) {
    this.showSpinnerName = true;
    this.complete = false;
    this.executed_name = true;
    await this.getUsernames();
    let id = this.getIdFromName(name);
    this.tasksByName = await this.apiservice.getTasksByUserId(id);
    this.swapIdToName(this.tasksByName)
    console.log(this.tasksByName);
    if (this.tasksByName.length === 0) {
      this.exists_byName = false;
      console.log("No tasks for this name exists.")
    } else this.exists_byName = true;
    this.sortData(this.tasksByName);
    this.showSpinnerName = false;
    this.complete = true;
    return this.tasksByName;
  }

  async getSubTasks(taskId) {
    this.showSpinner = true;
    this.complete = false;
    this.subTasks = await this.apiservice.getSubTasks(taskId);
    console.log('Subtasks');
    console.log(this.subTasks)
    this.sortData(this.subTasks);
    this.complete = true;
    this.showSpinner = false;
    return this.subTasks;
  }

  async createSubTask(){
    this.subTask.taskid = this.selectedTask.id;
    this.subTask.taskdate = this.getCurrentDate();
    this.subTask.details = this.subTaskDetails;
    this.subTask.subtask = this.subTaskName;
    this.subTask.progress = this.subTaskProgress;

    console.log(this.subTask)
    if(this.subTaskName !== undefined) {
      this.dontUpdate = false;
      await this.apiservice.addSubTask(this.subTask.id, this.subTask);
    } else {
      this.dontUpdate = true;
      console.log( 'There were undefined fields when creating a subtask')
    }

  }

  async updateTask(){
    this.task.task = this.selectedTask.task;
    this.task.details = this.selectedTask.details;
    this.task.id = this.selectedTask.id;
    this.task.taskdate = this.getCurrentDate();
    this.task.userid = this.getIdFromName(this.selectedTask.userid);
    this.task.progress = this.selectedTask.progress;
    if (!this.dontUpdate){
      await this.apiservice.updateTask(this.task)
    }
    console.log('Update');
    console.log(this.task);
  }

  openDialog() {
    let dialogVals: any = {subtask: "holder", progress: "holder", details: "holder"};
    let close : boolean;
    let dialogRef = this.dialog.open(SubtaskComponent, {
      data: {
        name: this.selectedTask.task
      }
    });

// Angular Material Function: Used for creating Subtasks
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result.data}`);
      dialogVals = result.data;
      close = result.data == true;
      console.log('dialog vals')
      console.log(dialogVals)
      this.subTaskProgress = dialogVals.progress;
      this.subTaskDetails = dialogVals.details;
      this.subTaskName = dialogVals.subtask;
    })

    if (close){
      this.subTaskProgress = undefined;
      this.subTaskName = undefined;
      this.subTaskDetails = undefined;
    }

      dialogRef.afterClosed().subscribe(() => {
        this.createSubTask();

      });

      dialogRef.afterClosed().subscribe(() => {
        this.updateTask();

      });

      dialogRef.afterClosed().subscribe(() => {
        this.getTasksToday();

      });

      dialogRef.afterClosed().subscribe(() => {
        this.getSubTasks(this.selectedTask.id);

      });

      dialogRef.afterClosed().subscribe(() => {
        this.getSubTasks(this.selectedTask.id);

      });
    }


    restrictAccess() {
        this.allowAccess = this.auth.isLoggedIn();
      }
}




  //   pageSlice = this.subTasks.slice(0,4);
  //
  // onPageChange($event){
  //   this.currentItemsToShow = this.subTasks;
  //   this.currentItemsToShow = this.subTasks.slice(
  //     $event.pageIndex * $event.pageSize,
  //     $event.pageIndex * $event.pageSize +
  //     $event.pageSize
  //   );
  //
  // }

  // percentToDecimal(percent){
  //   let parsePercent = parseFloat(percent);
  //   let decimal = parsePercent / 100
  //   console.log(typeof (decimal))
  //   return(decimal);
  // }

