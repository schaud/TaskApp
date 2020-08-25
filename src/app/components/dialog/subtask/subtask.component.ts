import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-subtask',
  templateUrl: './subtask.component.html',
  styleUrls: ['./subtask.component.css']
})
export class SubtaskComponent implements OnInit {
  action: string;
  local_data: any;

  constructor(public dialogRef: MatDialogRef<SubtaskComponent>, @Inject(MAT_DIALOG_DATA) public data:any) {
    this.local_data = {...data};
    this.action = this.local_data.action;
  }

  ngOnInit(): void {
  }

  subTaskName;
  subTaskDetails;
  subTaskProgress;
  badPercent: boolean = false;

  validate(percentage) {
    return percentage.match(/^(100|[1-9]?[0-9])$/) != null;
  }

  cancel(){
    this.dialogRef.close({
      data: {close: true}
    });
  }

  submit() {

    if (this.validate(this.subTaskProgress)){

      this.dialogRef.close({
        data:
          {
            subtask: this.subTaskName,
            details: this.subTaskDetails,
            progress: this.subTaskProgress,
          }
      });

  } else this.badPercent = true;
    }

}
