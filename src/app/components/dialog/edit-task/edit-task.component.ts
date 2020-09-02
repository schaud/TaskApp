import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ApiServiceService} from '@src/app/services/api-service.service';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent implements OnInit {

  action: string;
  local_data: any;
  details = this.data.task.details;
  progress = this.data.task.progress;
  task = this.data.task.task;
  taskdate = this.data.date;
  userid = this.data.task.userid;


  constructor(public dialogRef: MatDialogRef<EditTaskComponent>,
              @Inject(MAT_DIALOG_DATA) public data:any,
              private apiservice: ApiServiceService,
              public dialog: MatDialog) {

    this.local_data = {...data};
    this.action = this.local_data.action;
  }

  ngOnInit(): void {
    console.log(this.data)
  }

  cancel(){
    this.dialogRef.close({
      data: {close: true}
    });
  }

  submit() {

      this.dialogRef.close({
        data:
          {
            details : this.details,
            progress : this.progress,
            task : this.task,
            taskdate : this.taskdate,
            userid : this.userid
          }
      });

    console.log('onclose')
    console.log(this.data)


  }


}
