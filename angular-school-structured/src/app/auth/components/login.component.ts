
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: "\
  <form [formGroup]="form" (ngSubmit)="login()">
    <input formControlName="username" placeholder="Username">
    <input formControlName="password" type="password" placeholder="Password">
    <button>Login</button>
  </form>
});
export class LoginComponent {
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  constructor(private fb: FormBuilder, private router: Router) {}
  login() {
    if (this.form.valid) {
      localStorage.setItem('token', 'dummy-token');
      this.router.navigate(['/dashboard']);
    }
  }
}
