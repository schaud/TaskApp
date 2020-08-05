import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import { ApiServiceService} from '../../services/api-service.service';
import * as moment from 'moment';
import {MatExpansionPanel} from '@angular/material/expansion';
import {AuthorizationService} from '../../services/authorization.service';


@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  constructor(private apiservice: ApiServiceService, private auth: AuthorizationService) {
  }

  ngOnInit(): void {
    this.getTasksToday();
    this.getCurrentDate();
    console.log('Moment Date')
    console.log(this.momentDate)

  }


//Variables and sample jsons
//   @ViewChild('panel') panel:MatExpansionPanel;

  currentUser = localStorage.getItem('userEmail');
  selectedTask: any = {id: "holder", userid: "holder", task: "holder", progress: "holder", taskdate: "YYYY-MM-DD"};
  momentDate = moment.utc().utcOffset(-5).format('YYYY-MM-DD');
  name: String;
  date: any;
  usernames: any;
  newTask: string;
  newProgress: string;
  newDetails: string;
  id: number;
  exists_today: boolean;
  exists_byDate: boolean;
  exists_byName: boolean;
  executed_date: boolean = false;
  executed_name: boolean = false;
  newTaskReport: any = {id: "holder", userid: "holder", task: "holder", progress: "holder", taskdate: "YYYY-MM-DD"};
  tasks: any = {id: "holder", userid: "holder", task: "holder", progress: "holder", taskdate: "YYYY-MM-DD"};
  tasksByDate: any = {id: "holder", userid: "holder", task: "holder", progress: "holder", taskdate: "YYYY-MM-DD"};
  tasksByName: any = {id: "holder", userid: "holder", task: "holder", progress: "holder", taskdate: "YYYY-MM-DD"};
  subTasks: any = [
    {id: "holder", subtask: "holder", details: "holder", taskid: "holder", date: "YYYY-MM-DD"},
    {id: "holder", subtask: "holder", details: "holder", taskid: "holder", date: "YYYY-MM-DD"},
    {id: "holder", subtask: "holder", details: "holder", taskid: "holder", date: "YYYY-MM-DD"}
  ];
  show: boolean = false;
  showForm: boolean = true;
  subTaskName: string;
  subTaskDetails: string;
  subTask: any = {id: "holder", subtask: "holder", details: "holder", taskid: "holder", date: "YYYY-MM-DD"};
  expanded: boolean = false;
  task: any = {id: "holder", userid: "holder", task: "holder", progress: "holder", taskdate: "YYYY-MM-DD"};
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
    console.log(fullDate);
    return fullDate;
  }

  //API functions
  async getUsernames() {
    this.usernames = await this.apiservice.getAllUsers().then();
    console.log(this.usernames);
    return this.usernames;
  }

  async getTasksToday() {
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

  async submitTasks() {
    this.newTaskReport.taskdate = this.getCurrentDate();
    this.newTaskReport.id = '0';
    this.newTaskReport.userid = this.getIdFromEmail(this.currentUser);
    this.newTaskReport.details = this.newDetails;
    this.newTaskReport.task = this.newTask;
    this.newTaskReport.progress = this.newProgress;
    await this.apiservice.createTask(this.newTaskReport);
    console.log(this.newTaskReport)
  }

  async getTasksByDate() {
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
    return this.tasksByDate;
  }

  async getTasksByName(name) {
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
    return this.tasksByName;
  }

  async getSubTasks(taskId) {
    this.subTasks = await this.apiservice.getSubTasks(taskId);
    console.log('Subtasks');
    console.log(this.subTasks)
    this.sortData(this.subTasks);
    return this.subTasks;
  }

  sortData(array) {
    return array.sort((a, b) => {
      return <any> new Date(b.taskdate) - <any> new Date(a.taskdate);
    });


  }

  toggle() {
    this.show = !this.show;
  }

  showForm2(){
    this.showForm = true;
  }

  hideForm2(){
    this.showForm = false;
  }


  panelOpenState: boolean = false;

  togglePanel() {
    this.panelOpenState = !this.panelOpenState
  }

  async createSubTask(){
    this.subTask.taskid = this.selectedTask.id;
    this.subTask.taskdate = this.getCurrentDate();
    this.subTask.details = this.subTaskDetails;
    this.subTask.subtask = this.subTaskName;
    console.log(this.subTask)
    await this.apiservice.addSubTask(this.subTask.id, this.subTask);

  }

  async updateTask(){
    this.task.task = this.selectedTask.task;
    this.task.details = this.selectedTask.details;
    this.task.id = this.selectedTask.id;
    this.task.taskdate = this.getCurrentDate();
    this.task.userid = this.getIdFromName(this.selectedTask.userid);
    this.task.progress = this.selectedTask.progress;
    await this.apiservice.updateTask(this.task)
    console.log('Update');
    console.log(this.task);
  }
}
