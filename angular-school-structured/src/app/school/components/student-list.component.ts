
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-student-list',
  template: \`
  <h3>Students</h3>
  <table border="1">
    <tr><th>ID</th><th>Name</th></tr>
    <tr *ngFor="let s of students">
      <td>{{s.id}}</td>
      <td>{{s.name}}</td>
    </tr>
  </table>
  \`
})
export class StudentListComponent implements OnInit {
  students:any[] = [];
  ngOnInit() {
    this.students = [
      { id: 1, name: 'Akshay' },
      { id: 2, name: 'Rahul' }
    ];
  }
}
