import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AuthorizationService} from '../../../services/authorization.service';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent implements OnInit {
  action: string;
  local_data: any;

  constructor(public dialogRef: MatDialogRef<ForgotComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private auth: AuthorizationService) {
    this.local_data = {...data};
    this.action = this.local_data.action;
  }

  ngOnInit(): void {
  }

  newPassword = '';
  confirmNewPassword = '';
  match: boolean = true;
  code = '';
  enteredUser = false;
  reset = false;
  emailAddress = '';
  invalidCode = false;
  errorMessage = '';
  errorName = '';
  newCode = false;



  submitEmail() {
    if (this.emailAddress != '') {
      this.auth.forgotPasswordOpen(this.emailAddress);
    }
  }

  haveCode() {
    if (this.emailAddress != '') {
      this.enteredUser = true;
    }
  }


  async submit() {
    this.match = this.newPassword == this.confirmNewPassword;

    if (this.match && this.confirmNewPassword != '') {
      try {
        await this.auth.forgotPasswordSubmit(this.emailAddress, this.code, this.confirmNewPassword)
      } catch (error) {
        this.invalidCode = true;
        this.errorMessage = error.message;
        this.errorName = error.name;
        if (this.errorName === "ExpiredCodeException"){ this.newCode = true;}
        console.log(error)
      }

        if (!this.invalidCode) {
          this.reset = true;
          setTimeout(() => this.dialogRef.close({data: this.confirmNewPassword}), 3000);
        }

      } else  {
        this.match = false;
      }
    }

}
