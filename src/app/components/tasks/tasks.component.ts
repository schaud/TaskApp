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
import {EditTaskComponent} from '@src/app/components/dialog/edit-task/edit-task.component';


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

  obsCustom: Observable<any>;
  dataSourceCustom: MatTableDataSource<Task>;
  @ViewChild('customSort') customSort: MatSort;
  @ViewChild('paginatorCustom') paginatorCustom: MatPaginator;



  currentItemsToShow = [];
  currentItemsToShowName = [];
  currentItemsToShowDate = [];
  currentItemsToShowCustom = [];
  pageSize = 4; // number of tasks per page


  Stoday: boolean;
  Screate: boolean;
  Sdate: boolean;
  Sname: boolean;

  scrHeight: any;
  scrWidth: any;

  sortedData: Task[];
  subTaskFormDisplay = [];


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
    console.log('current user')
    console.log(this.currentUser)

    this.restrictAccess();
    console.log(this.auth.getAuthenticatedUser())
    this.checkIsAdmin();


    this.getCurrentDate();
    this.getUsernames();
    this.getTasksToday();


    this.data.sharedToday.subscribe(Stoday => this.Stoday = Stoday);
    this.data.sharedCreate.subscribe(Screate => this.Screate = Screate);
    this.data.sharedDate.subscribe(Sdate => this.Sdate = Sdate);
    this.data.sharedName.subscribe(Sname => this.Sname = Sname);

    this.dataSource = new MatTableDataSource<Task>(this.tasks);
    // this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.obs = this.dataSource.connect();

    this.dataSourceName = new MatTableDataSource<Task>(this.tasksByName);

    if (this.isAdmin) {
      this.dataSourceName.paginator = this.paginatorNameAdmin;
    }
    if (!this.isAdmin) {
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
customSearch: Task[] = Object.create(Task);
subTask: Subtask = Object.create(Subtask);
subTasks: Subtask[] = Object.create(Subtask);
subTaskFormName;
subTaskFormDetails;
TaskFormName;
TaskFormDetails;


//Variables: General and Application State
  currentUser = JSON.parse(localStorage.getItem('user'));
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
  exists_custom: boolean;
  executed_date: boolean = false;
  executed_name: boolean = false;
  executed_custom: boolean = false;
  dontUpdate: boolean = false;
  expanded: boolean = false;
  showSpinner: boolean = false;
  showSpinnerName: boolean = false;
  showSpinnerDate: boolean = false;
  showSpinnerCustom: boolean = false;
  badPercent: boolean = false;
  complete: boolean = false;
  allowAccess: boolean;
  isAdmin: boolean = false;
  validTask: boolean;
  validUser: boolean;
  freeTask = false;
  structuredTask = false;





//Utility functions

  async checkIsAdmin(){

    let users = await this.getUsernames();
    this.isAdmin = false;
    for (let user of users) {
      if (user.admin === "true" && user.email === this.currentUser.email) {
        this.isAdmin = true;
      }
    }
    if (!this.isAdmin){
      this.getTasksByName(this.currentUser.name);
    }
    console.log(this.isAdmin)
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

  async isUser(name){
    await this.getUsernames();
    let valid = false;
    for (let user of this.usernames){
      if (user.name === name){
        valid = true;
      }
    }

    return valid;
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
    console.log(this.usernames);
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
      return await this.apiservice.createTask(this.newTaskReport);
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

    this.complete = true;
    this.showSpinnerDate = false;
    return this.tasksByDate;
  }

  async getTasksByName(name) {
    this.showSpinnerName = true;
    this.executed_name = true;
    this.complete = false;
    await this.getUsernames();
    let id = await this.getIdFromName(await name);
    this.tasksByName = await this.apiservice.getTasksByUserId(id);
    await this.swapIdToName(this.tasksByName)
    // console.log(this.tasksByName);
    if (this.tasksByName.length === 0) {
      this.exists_byName = false;
      console.log("No tasks for this name exists.")
    } else {
      this.exists_byName = true;
    }
    this.sortData(this.tasksByName);

    this.dataSourceName = new MatTableDataSource<Task>(this.tasksByName);

    if (this.isAdmin){
      this.dataSourceName.paginator = this.paginatorNameAdmin;
    }
    if (!this.isAdmin){
      this.dataSourceName.paginator = this.paginatorName;
    }

    this.currentItemsToShowName = this.tasksByName.slice(0, this.pageSize);
    this.complete = true;
    this.showSpinnerName = false;
    return this.tasksByName;
  }

  async getTasksByDateAndName(){

    this.showSpinnerCustom = true;
    this.executed_custom = true;
    this.complete = false;

    if (this.name === undefined && this.date == 'NaN-aN-aN') {
      this.complete = true;
      this.showSpinnerCustom = false;
      this.customSearch = [];
      return;
    }

    if (this.name === undefined && this.date == '1969-12-31') {
      this.complete = true;
      this.showSpinnerCustom = false;
      this.customSearch = [];
      return;
    }

    let validUser = await this.isUser(this.name);
    if (validUser) {this.validUser = true}


    let id = await this.getIdFromName(this.name)
    console.log(this.date)
    console.log(this.name)
    console.log('id')
    console.log(id)


  if (this.date != 'NaN-aN-aN' && this.date != '1969-12-31' && id && id.length > 0 && validUser) {
    this.customSearch = await this.apiservice.getTaskByDateAndId(id, this.date)
    console.log('date and id')

  } else if (this.date && this.date != 'NaN-aN-aN' && this.date != '1969-12-31') {

    if (id === undefined){
      this.validUser = true;
      this.customSearch = await this.apiservice.getTasksByDate(this.date)
      // await this.swapIdToName(this.customSearch);
      console.log('date init custom search')
      console.log(this.customSearch)
      // this.exists_custom = this.customSearch.length !== 0;
      // this.complete = true;
      // this.showSpinnerCustom = false;
    }

    else if (!id && this.name.length > 0) {
      this.customSearch = [];
      this.validUser = false;
    }

    else if (!id && this.name.length > 0 && this.date == '1969-12-31' ) {
      this.customSearch = [];
      this.validUser = false;
    }

    else if (!id && this.name.length === 0) {
      this.customSearch = await this.getTasksByDate();
      console.log('date')
    }


  } else if (id) {
    this.customSearch = await this.apiservice.getTasksByUserId(id);
    console.log(' id')

  }

    else if (!id && this.name.length > 0 && this.date == 'NaN-aN-aN' ) {
      this.customSearch = [];
      this.validUser = false;
    }



      this.exists_custom = this.customSearch.length !== 0;

      await this.swapIdToName(this.customSearch);

      this.dataSourceCustom = new MatTableDataSource<Task>(this.customSearch);
      this.dataSourceCustom.paginator = this.paginatorCustom;
      this.obsCustom = this.dataSourceCustom.connect();
      this.currentItemsToShowCustom = this.customSearch.slice(0, this.pageSize);

      this.complete = true;
      this.showSpinnerCustom = false;
      return this.customSearch;
  }

  async getSubTasks(taskId) {
    this.showSpinner = true;
    this.complete = false;
    this.subTasks = await this.apiservice.getSubTasks(taskId);
    this.sortData(this.subTasks);
    this.complete = true;
    this.showSpinner = false;
    return this.subTasks;
  }

  async createSubTask() {
    this.subTask.userid = await this.getIdFromEmail(this.currentUser);
    this.subTask.taskid = this.selectedTask.id;
    this.subTask.taskdate = this.getCurrentDate();
    this.subTask.details = this.subTaskDetails;
    this.subTask.subtask = this.subTaskName;
    this.subTask.progress = this.subTaskProgress + '%';

    if (this.subTaskName !== undefined) {
      this.dontUpdate = false;
      await this.apiservice.addSubTask(this.subTask.id, this.subTask);
    } else {
      this.dontUpdate = true;
      console.log('There were undefined fields when creating a subtask')
    }

  }

  async updateTask(task : Task) {
    console.log('the task id')

    task.userid = await this.getIdFromName(this.selectedTask.userid);
    console.log('the task update')
    console.log(task.userid)
    if (!this.dontUpdate) {
      await this.apiservice.updateTask(task)
    }
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
      dialogVals = result.data;
      close = result.data == true;
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
      this.selectedTask.taskdate = this.getCurrentDate();
      this.updateTask(this.selectedTask);

    });

    dialogRef.afterClosed().subscribe(() => {
      this.getTasksToday();

    });

  }

  async editTasksDialog() {
    let updatedTask;
    let dialogRef = this.dialog.open(EditTaskComponent, {data: {task: this.selectedTask, date: this.getCurrentDate()}});
    dialogRef.afterClosed().subscribe(result => {
      updatedTask = result.data;
      console.log('Theupdatedtask')
      console.log(updatedTask)
    })

    dialogRef.afterClosed().subscribe(() => {
      this.updateTask(updatedTask);
    })

    dialogRef.afterClosed().subscribe(() => {
      this.getTasksToday();

    });


  }


  restrictAccess() {
    this.allowAccess = this.auth.isLoggedIn();
  }


  async openTasksDialog() {
    let dialogRef = this.dialog.open(SubtaskDetailsComponent, {data: {task: this.selectedTask},
      height: '700px'});

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog Tasks: ${result.data}`);
    })


    dialogRef.afterClosed().subscribe(() => {
      this.updateStructuredTask(this.selectedTask.id);

    });

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

  async onPageChangeCustom($event) {
    this.currentItemsToShowDate = this.customSearch;
    this.currentItemsToShowDate = this.customSearch.slice(
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
      this.freeTask = false;
      this.structuredTask = false;
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
      this.freeTask = false;
      this.structuredTask = false;
      try{
        this.paginator.firstPage();
        if (this.isAdmin){
          this.paginatorNameAdmin.firstPage();
          this.paginatorCustom.firstPage();
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
      this.freeTask = false;
      this.structuredTask = false;
      try{
        this.paginator.firstPage();
        if (this.isAdmin){
          this.paginatorNameAdmin.firstPage();
          this.paginatorCustom.firstPage();
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
      this.freeTask = false;
      this.structuredTask = false;
      try{
        this.paginator.firstPage();
        if (this.isAdmin){
          this.paginatorNameAdmin.firstPage();
          this.paginatorCustom.firstPage();
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
      this.currentItemsToShowCustom = this.sortedData.slice(0, this.pageSize);
    }
  }

  async switchToToday(){
    await this.getTasksToday();
    if (this.validTask && this.badPercent === false){
      this.tabGroup.selectedIndex = 0;
      this.selectedIndex = 0;
    }
    await this.getTasksToday();
  }


  addSubTaskForm() {
    let subTask = {subtask: this.subTaskFormName, details: this.subTaskFormDetails}
    this.subTaskFormDisplay.push(subTask);
    this.subTaskFormName = '';
    this.subTaskFormDetails = '';
  }

  removeSubTaskForm(index){
    this.subTaskFormDisplay.splice(index, 1);
  }

  async submitStructuredForm(){
    this.subTasks = [];
    let task : any = '';
    let user = await this.getIdFromEmail(this.currentUser);

    this.newDetails = this.TaskFormDetails.replace(/(\r\n|\n|\r)/gm, "");;
    this.newTask = this.TaskFormName;
    this.newProgress = '0';
    this.newTaskReport.type = 'structured';
    task = await this.submitTasks();

    console.log(task);



    for (let item of this.subTaskFormDisplay){
      let subTask : Subtask = Object.create(Subtask);

      subTask.userid = user;
      subTask.taskid = task.id;
      subTask.taskdate = this.getCurrentDate();
      subTask.details = item.details.replace(/(\r\n|\n|\r)/gm, "");
      subTask.subtask = item.subtask;
      subTask.progress = '0';
      this.subTasks.push(subTask)
    }

    console.log(this.subTasks)
    for (let item of this.subTasks){
      await this.apiservice.addSubTask(item.id, item);
    }

    this.subTaskFormName = '';
    this.subTaskFormDetails = '';
    this.TaskFormName = '' ;
    this.TaskFormDetails = '';

    await this.switchToToday();

  }

  async structuredProgress(taskId){
    let subTasks = await this.apiservice.getSubTasks(taskId)
    let progressArray = [];
    for (let subTask of subTasks){
      progressArray.push(Number(subTask.progress.replace('%', '')));
    }
    return progressArray.reduce((a,b) => a+b, 0)/progressArray.length;
  }

  async updateStructuredTask(taskId){
    let structuredProgress = await this.structuredProgress(taskId);
    this.selectedTask.progress = String(structuredProgress) + '%';
    await this.updateTask(this.selectedTask)

    if (!this.isAdmin && this.nameTab){
      this.getTasksByName(this.getNameFromEmail(this.currentUser));
    }
    if (this.todayTab){
      this.getTasksToday();
    }
    if (this.dateTab){
      this.getTasksByDate();

    }

  }


}



function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

