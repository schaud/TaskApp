import { Component, OnInit } from '@angular/core';
import { Auth } from 'aws-amplify';
import {AmplifyService} from 'aws-amplify-angular';
import {AuthorizationService} from '../../services/authorization.service';
import { Router } from '@angular/router';



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


  constructor(private auth: AuthorizationService, private router: Router) { }

  ngOnInit(): void {
  }


  onSubmit() {

    const email = this.emailAddress;
    const password = this.pass;

    this.auth.signIn(this.emailAddress, this.pass).subscribe((data) => {
      localStorage.setItem('userEmail',this.emailAddress);
      this.router.navigateByUrl('/home');
    }, (err)=> {
      this.emailVerificationMessage = true;
      this.error = true;
    });

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
