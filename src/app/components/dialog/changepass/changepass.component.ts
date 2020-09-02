import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ApiServiceService} from '@src/app/services/api-service.service';
import {AuthorizationService} from '@src/app/services/authorization.service';

@Component({
  selector: 'app-changepass',
  templateUrl: './changepass.component.html',
  styleUrls: ['./changepass.component.css']
})
export class ChangepassComponent implements OnInit {
  action: string;
  local_data: any;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  nullFields = false;
  noMatch = false;
  errorMessage = '';
  error = false;

  constructor(public dialogRef: MatDialogRef<ChangepassComponent>,
              @Inject(MAT_DIALOG_DATA) public data:any,
              private apiservice: ApiServiceService,
              public dialog: MatDialog,
              private auth: AuthorizationService) {

    this.local_data = {...data};
    this.action = this.local_data.action;
  }

  ngOnInit(): void {
  }

  async submit(){
    if(this.currentPassword != '' && this.newPassword != '' && this.confirmNewPassword != ''){
      if (this.newPassword === this.confirmNewPassword){
        try {
          await this.auth.changePassword(this.currentPassword, this.newPassword)
        } catch(error){
          this.error = true;
          this.errorMessage = error.message;
          console.log(error)
          console.log(this.errorMessage)
        }
      }
      else this.noMatch = true;
    } else {
      this.nullFields = true;
    }
  }

  close(){
    this.dialogRef.close();
  }

}
