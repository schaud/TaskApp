import { Injectable } from '@angular/core';
import {AuthenticationDetails, CognitoUser, CognitoUserPool} from 'amazon-cognito-identity-js';
// import { Observable } from 'rxjs/Observable';
import Observable from 'zen-observable';
import { BehaviorSubject} from "rxjs";



import {MatDialog} from '@angular/material/dialog';
import {ForgotComponent} from '../components/dialog/forgot/forgot.component';

const poolData = {
  UserPoolId: 'us-east-2_JQy9YBUJg', // Your user pool id here
  ClientId: '13fbvqm3f0032tnpqd2cr68jbc' // Your client id here
};

const userPool = new CognitoUserPool(poolData);


@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  private user = new BehaviorSubject('');
  private loggedIn = new BehaviorSubject(false)
  sharedUser = this.user.asObservable();
  sharedLoggedIn = this.loggedIn.asObservable();
  cognitoUser: any;
  newPassword;


  constructor(public dialog: MatDialog) { }

  register(email, password) {

    const attributeList = [];

    return new Observable(observer => {
      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          console.log("signUp error", err);
          observer.error(err);
        }

        this.cognitoUser = result.user;
        console.log("signUp success", result);
        observer.next(result);
        observer.complete();
      });
    });

  }

  confirmAuthCode(code) {
    const user = {
      Username: this.cognitoUser.username,
      Pool: userPool
    };
    return new Observable(observer => {
      const cognitoUser = new CognitoUser(user);
      cognitoUser.confirmRegistration(code, true, function(err, result) {
        if (err) {
          console.log(err);
          observer.error(err);
        }
        console.log("confirmAuthCode() success", result);
        observer.next(result);
        observer.complete();
      });
    });
  }

   signIn(email, password) {

    let self = this;

    const authenticationData = {
      Username: email,
      Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: email,
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);

    return new Observable(observer => {

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function(result) {

          //console.log(result);
          observer.next(result);
          observer.complete();
        },
        onFailure: function(err) {
          console.log(err);
          observer.error(err);
        },
        newPasswordRequired: async function(userAttributes) {
          let newPassword = await self.openDialog(userData.Username);
          console.log('The new password is')
          console.log(newPassword)
          delete userAttributes.email_verified;
          cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
        }
      });
    });
  }

  isLoggedIn() {
    return userPool.getCurrentUser() != null;
  }

  getAuthenticatedUser() {
    // gets the current user from the local storage
    return userPool.getCurrentUser();
  }

  logOut() {
    this.getAuthenticatedUser().signOut();
    this.cognitoUser = null;
  }

    async openDialog(email): Promise <any>{
    let dialogRef = this.dialog.open(ForgotComponent, {data : {email: email}});
    let password: string = '';

      return dialogRef.afterClosed().toPromise().then(result => {
       this.newPassword = result.data;
       console.log(`New password is: ${password}`);
       return Promise.resolve(result.data)
      });
    }

  sendUser(user: string){
    this.user.next(user)
  }

  sendState(state: boolean){
    this.loggedIn.next(state)
  }

  // pushCreate(){
  //   return this.create.asObservable();
  // }
  //
  // pushToday(){
  //   return this.today.asObservable();
  // }
  //
  // pushDate(){
  //   return this.date.asObservable();
  // }
  //
  // pushName(){
  //   return this.name.asObservable();
  // }





}
