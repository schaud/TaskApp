import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { TasksComponent } from './components/tasks/tasks.component';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { LoginComponent } from './components/login/login.component';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { AppRoutingModule } from './app-routing.module';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatExpansionModule} from '@angular/material/expansion';
import { AmplifyService, AmplifyAngularModule } from 'aws-amplify-angular';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { ForgotComponent } from './components/dialog/forgot/forgot.component';
import {MatDialogModule} from '@angular/material/dialog';
import { SubtaskComponent } from './components/dialog/subtask/subtask.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatPaginatorModule} from '@angular/material/paginator';


@NgModule({
  declarations: [
    AppComponent,
    TasksComponent,
    LoginComponent,
    ForgotComponent,
    SubtaskComponent,
  ],
  entryComponents: [ForgotComponent],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    AmplifyAngularModule,
    ScrollingModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
  ],
  providers: [HttpClient, AmplifyService],
  bootstrap: [AppComponent]
})
export class AppModule { }
