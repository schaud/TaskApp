import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ApiServiceService} from '../../../services/api-service.service';
import saveAs from 'save-as';

@Component({
  selector: 'app-subtask-details',
  templateUrl: './subtask-details.component.html',
  styleUrls: ['./subtask-details.component.css']
})
export class SubtaskDetailsComponent implements OnInit {

  action: string;
  local_data: any;
  showSpinner;
  complete;
  subTasks: any = [
    {id: "holder", subtask: "holder", details: "holder", taskid: "holder", date: "YYYY-MM-DD", progress: 'holder'},
    {id: "holder", subtask: "holder", details: "holder", taskid: "holder", date: "YYYY-MM-DD", progress: 'holder'},
    {id: "holder", subtask: "holder", details: "holder", taskid: "holder", date: "YYYY-MM-DD", progress: 'holder'}
  ];

  constructor(public dialogRef: MatDialogRef<SubtaskDetailsComponent>,
              @Inject(MAT_DIALOG_DATA) public data:any,
              private apiservice: ApiServiceService,
              public dialog: MatDialog) {

    this.local_data = {...data};
    this.action = this.local_data.action;
  }

  ngOnInit(): void {
    console.log(this.data)
    this.getSubTasks(this.data.task.id)
  }

  sortData(array) {
    return array.sort((a, b) => {
      return <any> new Date(b.taskdate) - <any> new Date(a.taskdate);
    });
  }

  async getSubTasks(taskId) {
    this.showSpinner = true;
    this.complete = false;
    this.subTasks = await this.apiservice.getSubTasks(taskId);
    console.log(this.subTasks)
    this.sortData(this.subTasks);
    this.complete = true;
    this.showSpinner = false;
    return this.subTasks;
  }

  close(){
    this.dialogRef.close();
  }

  downloadSubTasks() {
    let blob = new Blob(
      [JSON.stringify(this.data, null, 2), "\n\n", JSON.stringify(this.subTasks,null, 2)],
      { type: 'text/plain;charset=utf-8' })
    saveAs(blob, `${localStorage.getItem('UserEmail')}_subtasks.txt`)
  }




}
