import {ChangeDetectorRef, Component, OnInit, HostListener, ViewChild} from '@angular/core';
import { ApiServiceService} from '../../services/api-service.service';
import * as moment from 'moment';
import {MatDialog} from '@angular/material/dialog';
import {SubtaskComponent} from '../dialog/subtask/subtask.component';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {AuthorizationService} from '../../services/authorization.service';
import {Observable} from 'rxjs';
import {DataService} from '../../services/data.service';
import {SubtaskDetailsComponent} from '../dialog/subtask-details/subtask-details.component';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTabChangeEvent, MatTabGroup} from '@angular/material/tabs';
import { Task } from '../../models/Task';
import { Subtask } from '../../models/Subtask';
import {User} from '@src/app/models/User';


@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})



export class TasksComponent implements OnInit {

  @ViewChild('tabGroup') tabGroup: MatTabGroup;


  obs: Observable<any>;
  dataSource: MatTableDataSource<Task>;
  @ViewChild('todaySort') todaySort: MatSort;
  @ViewChild('paginator') paginator: MatPaginator;

  obsName: Observable<any>;
  dataSourceName: MatTableDataSource<Task>;
  @ViewChild('nameSort') nameSort: MatSort;
  @ViewChild('paginatorName') paginatorName: MatPaginator;

  @ViewChild('nameSortAdmin') nameSortAdmin: MatSort;
  @ViewChild('paginatorNameAdmin') paginatorNameAdmin: MatPaginator;


  obsDate: Observable<any>;
  dataSourceDate: MatTableDataSource<Task>;
  @ViewChild('dateSort') dateSort: MatSort;
  @ViewChild('paginatorDate') paginatorDate: MatPaginator;

  currentItemsToShow = [];
  currentItemsToShowName = [];
  currentItemsToShowDate = [];
  pageSize = 4; // number of tasks per page


  Stoday: boolean;
  Screate: boolean;
  Sdate: boolean;
  Sname: boolean;

  scrHeight: any;
  scrWidth: any;

  sortedData: Task[];

  constructor(private apiservice: ApiServiceService, public dialog: MatDialog,
              private auth: AuthorizationService, private data: DataService, private cdr: ChangeDetectorRef) {
    this.getScreenSize();
    // this.sortedData = this.tasks.slice();
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrHeight = window.innerHeight;
    this.scrWidth = window.innerWidth;
  }


  ngOnInit(): void {

    this.restrictAccess();
    console.log(this.auth.getAuthenticatedUser())
    this.checkIsAdmin();


    this.getCurrentDate();
    this.getUsernames();
    this.getTasksToday();
    if (!this.isAdmin){
      this.getTasksByName(this.getNameFromEmail(this.currentUser));
    }



    this.data.sharedToday.subscribe(Stoday => this.Stoday = Stoday);
    this.data.sharedCreate.subscribe(Screate => this.Screate = Screate);
    this.data.sharedDate.subscribe(Sdate => this.Sdate = Sdate);
    this.data.sharedName.subscribe(Sname => this.Sname = Sname);

    this.dataSource = new MatTableDataSource<Task>(this.tasks);
    // this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.obs = this.dataSource.connect();

    this.dataSourceName = new MatTableDataSource<Task>(this.tasksByName);

    if (this.isAdmin){
      this.dataSourceName.paginator = this.paginatorNameAdmin;
    }
    if (!this.isAdmin){
      this.dataSourceName.paginator = this.paginatorName;
    }
    this.obsName = this.dataSourceName.connect();
    this.cdr.detectChanges();
  }

//Objects
usernames: User[] = Object.create(User);
task: Task = Object.create(Task);
newTaskReport: Task = Object.create(Task);
tasks: Task[] = Object.create(Task);
tasksByDate: Task[] = Object.create(Task);
tasksByName: Task[] = Object.create(Task);
subTask: Subtask = Object.create(Subtask);
subTasks: Subtask[] = Object.create(Subtask);



//Variables: General and Application State
  currentUser = localStorage.getItem('UserEmail');
  selectedTask: Task = Object.create(Task);
  momentDate = moment.utc().utcOffset(-5).format('YYYY-MM-DD');
  name: String;
  date: any;
  newTask: string;
  newProgress: string;
  newDetails: string;
  id: number;
  subTaskName: string;
  subTaskDetails: string;
  subTaskProgress: string;
  subTaskUserId: string;
  selectedIndex;
  calDate = '';

//Variables : Boolean flags
  exists_today: boolean;
  exists_byDate: boolean;
  exists_byName: boolean;
  executed_date: boolean = false;
  executed_name: boolean = false;
  dontUpdate: boolean = false;
  expanded: boolean = false;
  showSpinner: boolean = false;
  showSpinnerName: boolean = false;
  showSpinnerDate: boolean = false;
  badPercent: boolean = false;
  complete: boolean = false;
  allowAccess: boolean;
  isAdmin: boolean = false;
  validTask: boolean;





//Utility functions

  async checkIsAdmin(){

    let users = await this.getUsernames();
    for (let user of users) {
      if (user.admin === "true" && user.email === this.currentUser) {
        this.isAdmin = true;
      }
    }
  }
  async swapIdToName(taskList: any) {
    await this.getUsernames();
    for (let task of await taskList) {
      for (let employee of this.usernames) {
        if (task.userid == employee.id)
          task.userid = employee.name;
      }
    }
  }

  async getIdFromName(username) {
    await this.getUsernames();
    let result;
    for (let user of this.usernames) {
      if (user.name == await username) {
        result = user.id;
      }
    }
    return result;
  }

  async getIdFromEmail(email) {
    await this.getUsernames();
    let result;
    for (let user of this.usernames) {
      if (user.email == await email) {
        result = user.id;
      }
    }
    return result;
  }

  async getNameFromEmail(email) {
    await this.getUsernames();
    let result;
    for (let user of this.usernames) {
      if (user.email == await email) {
        result = user.name;
      }
    }
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

  validatePercent(percentage) {

    // return percentage.match(/^(100(\.0{1,2})?|[1-9]?\d(\.\d{1,2})?%)$/) != null;
    // return percentage.match(/^[0-9][0-9]?$|^100$/) != null;
    return percentage.match(/^(100|[1-9]?[0-9])$/) != null;




  }

  async validateTaskName(taskName){
    let allTasks = await this.getAllTasks();
    let exists = false;
    for (let task of allTasks){
      if (task.task == taskName && task.progress != '100%'){
        console.log('Task already exists')
        exists = true;
        return false;
      }
    }
    if (!exists) return true;

  }

  convertDate(str) {
    let date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
  }

//   console.log(convert("Thu Jun 09 2011 00:00:00 GMT+0530 (India Standard Time)"))
// //-> "2011-06-08"


  //API functions
  async getUsernames() {
    this.usernames = await this.apiservice.getAllUsers().then();
    // console.log(this.usernames);
    return this.usernames;
  }

  async getTasksToday() {
    this.showSpinner = true;
    if (!this.dontUpdate) {
      await this.getUsernames();
      this.tasks = await this.apiservice.getTasksToday().then();
      this.swapIdToName(this.tasks)
      // console.log(this.tasks)
      if (this.tasks.length === 0) {
        this.exists_today = false;
        console.log("No such Task ID exists")
      } else this.exists_today = true;
      console.log('Authenitcated User')
      console.log(this.currentUser)

      this.dataSource = new MatTableDataSource<Task>(this.tasks);
      this.dataSource.paginator = this.paginator;
      this.currentItemsToShow = this.tasks.slice(0, this.pageSize);

      this.showSpinner = false;
      return this.tasks;
    } else return;
  }

  async submitTasks() {
    this.validTask = null;
    this.newTaskReport.taskdate = this.getCurrentDate();
    this.newTaskReport.id = '0';
    this.newTaskReport.userid = await this.getIdFromEmail(this.currentUser);
    this.newTaskReport.details = this.newDetails;
    this.newTaskReport.task = this.newTask;
    this.newTaskReport.progress = this.newProgress;
    this.validTask = await this.validateTaskName(this.newTaskReport.task);

    console.log(this.newTaskReport.task)
    console.log('Task:' + this.validTask)

    this.badPercent = false;
    if (this.validatePercent(this.newTaskReport.progress) && this.validTask) {
      this.newTaskReport.progress = this.newProgress + '%';
      await this.apiservice.createTask(this.newTaskReport);
      // console.log(this.newTaskReport)
    } else if (!this.validatePercent(this.newTaskReport.progress)) {
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

    this.dataSourceDate = new MatTableDataSource<Task>(this.tasksByDate);
    this.dataSourceDate.paginator = this.paginatorDate;
    this.obsDate = this.dataSource.connect();
    this.currentItemsToShowDate = this.tasksByDate.slice(0, this.pageSize);


    this.showSpinnerDate = false;
    this.complete = true;
    return this.tasksByDate;
  }

  async getTasksByName(name) {
    this.showSpinnerName = true;
    this.complete = false;
    this.executed_name = true;
    await this.getUsernames();
    let id = await this.getIdFromName(await name);
    this.tasksByName = await this.apiservice.getTasksByUserId(id);
    await this.swapIdToName(this.tasksByName)
    // console.log(this.tasksByName);
    if (this.tasksByName.length === 0) {
      this.exists_byName = false;
      console.log("No tasks for this name exists.")
    } else this.exists_byName = true;
    this.sortData(this.tasksByName);

    this.dataSourceName = new MatTableDataSource<Task>(this.tasksByName);

    if (this.isAdmin){
      this.dataSourceName.paginator = this.paginatorNameAdmin;
    }
    if (!this.isAdmin){
      this.dataSourceName.paginator = this.paginatorName;
    }

    this.currentItemsToShowName = this.tasksByName.slice(0, this.pageSize);
    this.showSpinnerName = false;
    this.complete = true;
    return this.tasksByName;
  }

  async getSubTasks(taskId) {
    this.showSpinner = true;
    this.complete = false;
    this.subTasks = await this.apiservice.getSubTasks(taskId);
    // console.log('Subtasks');
    // console.log(this.subTasks)
    this.sortData(this.subTasks);
    this.complete = true;
    this.showSpinner = false;
    return this.subTasks;
  }

  async createSubTask() {
    this.subTask.userid = this.subTaskUserId;
    this.subTask.taskid = this.selectedTask.id;
    this.subTask.taskdate = this.getCurrentDate();
    this.subTask.details = this.subTaskDetails;
    this.subTask.subtask = this.subTaskName;
    this.subTask.progress = this.subTaskProgress;

    // console.log(this.subTask)
    if (this.subTaskName !== undefined) {
      this.dontUpdate = false;
      await this.apiservice.addSubTask(this.subTask.id, this.subTask);
    } else {
      this.dontUpdate = true;
      console.log('There were undefined fields when creating a subtask')
    }

  }

  async updateTask() {
    this.task.task = this.selectedTask.task;
    this.task.details = this.selectedTask.details;
    this.task.id = this.selectedTask.id;
    this.task.taskdate = this.getCurrentDate();
    this.task.userid = await this.getIdFromName(this.selectedTask.userid);
    this.task.progress = this.selectedTask.progress;
    if (!this.dontUpdate) {
      await this.apiservice.updateTask(this.task)
    }
    // console.log('Update');
    // console.log(this.task);
  }

  async getAllTasks(){
    return await this.apiservice.getAllTasks();
  }



  // Angular Material Function: Used for creating Subtasks

  openDialog() {
    let dialogVals: any = {subtask: "holder", progress: "holder", details: "holder"};
    let close: boolean;
    let dialogRef = this.dialog.open(SubtaskComponent, {
      data: {
        name: this.selectedTask.task
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      // console.log(`Dialog result: ${result.data}`);
      dialogVals = result.data;
      close = result.data == true;
      // console.log('dialog vals')
      // console.log(dialogVals)
      this.subTaskProgress = dialogVals.progress;
      this.subTaskDetails = dialogVals.details;
      this.subTaskName = dialogVals.subtask;
      this.subTaskUserId = await this.getIdFromEmail(this.currentUser);

    })

    if (close) {
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


  async openTasksDialog() {
    let taskDetails;
    let dialogRef = this.dialog.open(SubtaskDetailsComponent, {data: {task: this.selectedTask},
      height: '700px'});
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog Tasks: ${result.data}`);
      taskDetails = result.data;
    })
    return taskDetails;
  }

  async onPageChange($event) {
    this.currentItemsToShow = this.tasks;
    this.currentItemsToShow = this.tasks.slice(
      $event.pageIndex * $event.pageSize,
      $event.pageIndex * $event.pageSize +
      $event.pageSize
    );
  }

  async onPageChangeName($event) {
    this.currentItemsToShowName = this.tasksByName;
    this.currentItemsToShowName = this.tasksByName.slice(
      $event.pageIndex * $event.pageSize,
      $event.pageIndex * $event.pageSize +
      $event.pageSize
    );
  }

  async onPageChangeDate($event) {
    this.currentItemsToShowDate = this.tasksByDate;
    this.currentItemsToShowDate = this.tasksByDate.slice(
      $event.pageIndex * $event.pageSize,
      $event.pageIndex * $event.pageSize +
      $event.pageSize
    );
  }

  todayTab = true;
  createTab = false;
  nameTab = false;
  dateTab = false;

  tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
    console.log('tabChangeEvent => ', tabChangeEvent);
    console.log('index => ', tabChangeEvent.index);

    if (tabChangeEvent.index == 0) {
      this.todayTab = true;
      this.createTab = false;
      this.nameTab = false;
      this.dateTab = false;
      try{
        this.paginator.firstPage();

        if (this.isAdmin){
          this.paginatorNameAdmin.firstPage();
        }

        if (!this.isAdmin){
          this.paginatorName.firstPage();
        }

        this.paginatorDate.firstPage();
      } catch(error){}
    }

    if (tabChangeEvent.index == 1) {
      this.todayTab = false;
      this.createTab = true;
      this.nameTab = false;
      this.dateTab = false;
      try{
        this.paginator.firstPage();
        if (this.isAdmin){
          this.paginatorNameAdmin.firstPage();
        }
        if (!this.isAdmin){
          this.paginatorName.firstPage();
        }
        this.paginatorDate.firstPage();
      } catch(error){}
    }

    if (tabChangeEvent.index == 2) {
      this.todayTab = false;
      this.createTab = false;
      this.nameTab = true;
      this.dateTab = false;
      try{
        this.paginator.firstPage();
        if (this.isAdmin){
          this.paginatorNameAdmin.firstPage();
        }
        if (!this.isAdmin){
          this.paginatorName.firstPage();
        }
        this.paginatorDate.firstPage();
      } catch(error){}
    }

    if (tabChangeEvent.index == 3) {
      this.todayTab = false;
      this.createTab = false;
      this.nameTab = false;
      this.dateTab = true;
      try{
        this.paginator.firstPage();
        if (this.isAdmin){
          this.paginatorNameAdmin.firstPage();
        }
        if (!this.isAdmin){
          this.paginatorName.firstPage();
        }
        this.paginatorDate.firstPage();
      } catch(error){}
    }

  }

  sortTasks(sort: Sort, taskArray: Task[]) {
    const data = taskArray.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'task' :
          return compare(a.task, b.task, isAsc);
        case 'name' :
          return compare(a.id, b.id, isAsc);
        case 'date' :
          return compare(a.taskdate, b.taskdate, isAsc);
        case 'progress' :
          return compare(a.progress, b.progress, isAsc);
        default:
          return 0;
      }
    }
    );

    if (this.todayTab){
      this.currentItemsToShow = this.sortedData.slice(0, this.pageSize)
    } else if (this.nameTab){
      this.currentItemsToShowName = this.sortedData.slice(0, this.pageSize)
    } else if (this.dateTab){
      this.currentItemsToShowDate = this.sortedData.slice(0, this.pageSize)
    }
  }

  async switchToToday(){
    await this.getTasksToday();
    if (this.validTask && this.badPercent === false){
      this.tabGroup.selectedIndex = 0;
      this.selectedIndex = 0;
    }
  }
}



function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

