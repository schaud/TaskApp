import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent implements OnInit {
  action: string;
  local_data: any;

  constructor(public dialogRef: MatDialogRef<ForgotComponent>, @Inject(MAT_DIALOG_DATA) public data:any) {
    this.local_data = {...data};
    this.action = this.local_data.action;
  }

  newPassword = '';
  confirmNewPassword = '';
  match: boolean = true;


  ngOnInit(): void {
  }

  cancel(){
    this.dialogRef.close();
  }

  submit(){
    this.match = this.newPassword == this.confirmNewPassword;
    if (this.match && this.confirmNewPassword != ''){
      this.dialogRef.close({data: this.confirmNewPassword});
    }
    else{
      this.match = false;
      console.log('Passwords do not match!')
    }
  }

}
