
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
  <h2>Students</h2>
  <table border="1">
    <tr><th>ID</th><th>Name</th></tr>
    <tr *ngFor="let s of students">
      <td>{{s.id}}</td>
      <td>{{s.name}}</td>
    </tr>
  </table>
  `
})
export class DashboardComponent implements OnInit {
  students = [];

  ngOnInit() {
    this.students = [
      { id: 1, name: 'Rahul' },
      { id: 2, name: 'Anita' }
    ];
  }
}
