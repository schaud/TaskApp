import { NgModule } from '@angular/core';
import { LoginComponent } from './components/login/login.component';
import {RouterModule, Routes} from '@angular/router';
import {TasksComponent} from './components/tasks/tasks.component';


const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home', component: TasksComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})

export class AppRoutingModule{}
