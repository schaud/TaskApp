import { Component, OnInit } from '@angular/core';
import { Auth } from 'aws-amplify';
import {AmplifyService} from 'aws-amplify-angular';
import {AuthorizationService} from '../../services/authorization.service';
import { Router } from '@angular/router';
import {ForgotComponent} from '../dialog/forgot/forgot.component';
import {MatDialog} from '@angular/material/dialog';

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


  constructor(private auth: AuthorizationService, private router: Router, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.auth.sharedUser.subscribe(user => this.user = user);
  }


  onSubmit() {

    const email = this.emailAddress;
    const password = this.pass;

    this.auth.signIn(this.emailAddress, this.pass).subscribe((data) => {
      localStorage.setItem('userEmail',this.emailAddress);
      this.user = this.emailAddress;
      this.auth.sendUser(this.user);

      this.router.navigateByUrl('/home');
    }, (err)=> {
      this.emailVerificationMessage = true;
      this.error = true;
    });

  }

  openDialog(){
    let newPass;
    let dialogRef = this.dialog.open(ForgotComponent, {data : {email: this.emailAddress}});
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
