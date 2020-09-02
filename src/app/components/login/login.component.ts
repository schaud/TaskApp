import { Component, OnInit } from '@angular/core';
import { Auth } from 'aws-amplify';
import {AmplifyService} from 'aws-amplify-angular';
import {AuthorizationService} from '../../services/authorization.service';
import { Router } from '@angular/router';
import {NewpasswordComponent} from '../dialog/newpassword/newpassword.component';
import {MatDialog} from '@angular/material/dialog';
import {VersionComponent} from '../dialog/version/version.component';
import {ForgotComponent} from '../dialog/forgot/forgot.component';
import {ApiServiceService} from '@src/app/services/api-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  emailAddress = '';
  pass = '';
  repass = '';
  emailVerificationMessage: boolean = false;
  error : boolean = false;
  match: boolean;
  user: string;
  loggedIn: boolean = false;


  constructor(private auth: AuthorizationService, private router: Router, public dialog: MatDialog,
  private api: ApiServiceService ) { }

  ngOnInit(): void {
    this.auth.sharedUser.subscribe(user => this.user = user);
    this.auth.sharedLoggedIn.subscribe(loggedIn => this.loggedIn = loggedIn);

  }


  async onSubmit() {
    let allUsers = await this.api.getAllUsers();
    let currentUser

    await this.auth.signIn(this.emailAddress, this.pass).subscribe((data) => {
      for (let user of allUsers){
        if (user.email == this.emailAddress){
           currentUser = user;
        }
      }

      localStorage.setItem('user', JSON.stringify(currentUser));
      localStorage.setItem('userEmail', this.emailAddress);
      this.user = this.emailAddress;
      this.auth.sendUser(this.user);
      this.loggedIn = true;
      this.auth.sendState(this.loggedIn);
      console.log(data);
      localStorage.setItem('loggedIn', String(this.loggedIn));


      this.router.navigateByUrl('/home');
    }, (err)=> {
      this.emailVerificationMessage = true;
      this.error = true;
      console.log(err)
    });

  }

  openForgot(){
    let dialogRef = this.dialog.open(ForgotComponent);
  }


  openDialog(){
    let newPass;
    let dialogRef = this.dialog.open(NewpasswordComponent, {data : {email: this.emailAddress}});
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result.data}`);
      newPass = result.data;
    })

    return newPass;


  }


  // async loginAuth() {
  //    this.amp.auth().signIn(this.emailAddress, this.pass).then(() => {
  //      Auth.currentAuthenticatedUser().then((user) => {
  //        console.log('user email = ' + user.attributes.email);
  //      });
  //      // window.location.href = '/home';
  //   });
  // }
  //
  // async loginAuth2(){
  //   try {
  //     const user = await Auth.signIn(this.emailAddress, this.pass);
  //     console.log('success')
  //   } catch (error) {
  //     console.log('error signing in', error);
  //   }
  // }




}
