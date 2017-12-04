import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppComponent } from '../app.component';

import * as $ from 'jquery/dist/jquery.min.js';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public login : string = '';
  public passw : string = '';

  // признаки ошибок заполнения формы авторизации
  public errors = {
    login: false,
    passw: false
  }

  constructor(private router : Router) { }

  ngOnInit() {
    if (AppComponent.self.authorized) {
      this.router.navigateByUrl('/news');
    }
  }

  public signIn() : void {
    if (!this.login || this.login.match(/\s+/)) {
      this.errors.login = true;
      return;
    } else {
      this.errors.login = false;
    }
    if (!this.passw || this.passw.match(/\s+/)) {
      this.errors.passw = true;
      return;
    } else {
      this.errors.passw = false;
    }

    $.ajax(AppComponent.USER_DATA, {
      method: 'GET',
      dataType: 'json',
      success: (data : any[]) => {
        let index : number = -1;
        for (let i = 0; i < data.length; i++) {
          if (data[i].login   === this.login &&
              data[i].passw   === this.passw &&
              data[i].enabled === true) {
            index = i;
            break;
          }
        }
        if (index !== -1) { // найден пользователь с заданным логином и паролем
          this.login = '';
          this.passw = '';
          AppComponent.self.authorized   = true;
          AppComponent.self.current_user = {
            id      : data[index].id,
            login   : data[index].login,
            name    : data[index].name,
            email   : data[index].email,
            enabled : data[index].enabled
          };
    
          // сохраняем авторизацию в session storage
          sessionStorage.setItem('angular.news.user', JSON.stringify(AppComponent.self.current_user));
    
          this.router.navigateByUrl('/news');
        } else { // пользователь не найден
          window.alert('Было задано неправильное сочетание логина и пароля!');
        }
      }
    });
  }
}
