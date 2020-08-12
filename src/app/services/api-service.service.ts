import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

  constructor(private http: HttpClient) { }

  path = 'https://46odim7l6f.execute-api.us-east-2.amazonaws.com/beta';

  getAllUsers(): Promise<any>{
    return this.http.get<any>(`${this.path}/id/`).toPromise();
  }
  getUserById(id): Promise<any> {
    return this.http.get<any>(`${this.path}/id/${id}`).toPromise();
  }

  getAllTasks(): Promise<any>{
    return this.http.get<any>(`${this.path}/task/`).toPromise();
  }

  getTaskByTaskId(taskid): Promise<any>{
    return this.http.get<any>(`${this.path}/task/?taskid=${taskid}`).toPromise();
  }

  getTasksToday(): Promise<any>{
    return this.http.get<any>(`${this.path}/task/today`).toPromise();
  }

  createTask(task: any): Promise<any>{
    return this.http.post<any>(`${this.path}/task/`, task).toPromise();
  }

  updateTask(task: any): Promise<any>{
    return this.http.put<any>(`${this.path}/task/`, task).toPromise();
  }

  getTasksByDate(date): Promise<any> {
    return this.http.get<any>(`${this.path}/task?date=${date}`).toPromise();
  }

  getTasksByUserId(userid): Promise<any> {
    return this.http.get<any>(`${this.path}/task?userid=${userid}`).toPromise();
  }

  getTaskByDateAndId(id, date): Promise<any> {
    return this.http.get<any>(`${this.path}/task?id=${id}&date=${date}`).toPromise();
  }

  getSubTasks(taskId): Promise <any>{
    return this.http.get<any>(`${this.path}/task?subtask=${taskId}`).toPromise();
  }

  addSubTask(id, subTask: any): Promise<any>{
    return this.http.post<any>(`${this.path}/task/${id}`, subTask).toPromise();
  }

}
//
