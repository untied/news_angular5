import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AppComponent } from '../app.component';

import * as $ from 'jquery/dist/jquery.min.js';

enum UsersMode { // возможные режимы работы компонента
  list,   // список пользователей
  create, // создание нового пользователя
  modify  // редактирование пользователя
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public UsersMode = UsersMode;

  public mode    : UsersMode = null; // текущий режим контроллера
  public users   : any[]     = null; // список пользователей
  public cuserId : number    = -1;   // идентификатор текущего пользователя

  public userData = {
    id      : -1,
    login   : '',
    passw   : '',
    passw2  : '',
    name    : '',
    email   : '',
    enabled : true
  };

  // конструктор
  constructor(private router : Router, private route : ActivatedRoute) {
    this.route.params.subscribe(res => this.userData.id = res.id ? parseInt(res.id) : -1);
  }

  // инициализация компонента
  ngOnInit() {
    // текущий пользователь
    this.cuserId = AppComponent.self.current_user.id;

    // загрузка списка пользователей при необходимости
    if (this.users === null) {
      if (AppComponent.self.users !== null) {
        this.users = AppComponent.self.users;
      } else {
        $.ajax(AppComponent.USER_DATA, {
          method: 'GET',
          dataType: 'json',
          success: (data : any[]) => {
            AppComponent.self.users = this.users = data;
          }
        });
      }
    }
    if (this.router.url === '/users') {
      this.mode = UsersMode.list;
    } else {
      this.userData.login   = '';
      this.userData.passw   = '';
      this.userData.passw2  = '';
      this.userData.name    = '';
      this.userData.email   = '';
      this.userData.enabled = true;
      if (this.router.url === '/users/create') {
        this.mode = UsersMode.create;
        this.userData.id = -1;
      } else {
        this.mode = UsersMode.modify;
        if (this.userData.id != -1) {
          for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].id === this.userData.id) {
              this.userData.login   = this.users[i].login;
              this.userData.name    = this.users[i].name;
              this.userData.email   = this.users[i].email;
              this.userData.enabled = this.users[i].enabled;
              break;
            }
          }
        }
      }
    }
  }

  // включить/выключить пользователя
  public setEnabled(userId : number, enabled : boolean) : void {
    if (userId !== this.cuserId) { // самого себя нельзя отключать
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].id === userId) {
          this.users[i].enabled = enabled;
          break;
        }
      }
    }
  }

  // редактировать пользователя
  public modifyUser(userId : number) : void {
    this.router.navigateByUrl(`/users/modify/${userId}`);
  }

  // сохранение пользователя
  public saveUser() : void {
    if (!this.userData.login || this.userData.login.match(/\s+/)) {
      window.alert('Пожалуйста, введите корректный логин пользователя!')
      return
    }
    if (this.mode === UsersMode.create) { // если создается новый пользователь
      if (!this.userData.passw || this.userData.passw.match(/\s+/)) {
        window.alert('Пожалуйста, введите корректный пароль пользователя!')
        return
      }
      if (this.userData.passw2 !== this.userData.passw) {
        window.alert('Пожалуйста, введите два совпадающих пароля пользователя!')
        return
      }
    } else { // если редактируется новый пользователь
      if (this.userData.passw && this.userData.passw2 !== this.userData.passw) {
        window.alert('Пожалуйста, введите два совпадающих пароля пользователя!')
        return
      }
    }
    if (!this.userData.name) {
      window.alert('Пожалуйста, введите корректно ФИО пользователя!')
      return
    }
    if (!this.userData.email) {
      window.alert('Пожалуйста, введите корректно email пользователя!')
      return
    }
    if (window.confirm('Вы действительно хотите сохранить информацию о пользователе?')) {
      if (this.mode === UsersMode.create) { // создание пользователя
        let pool : number[] = [];
        for (let i = 0; i < this.users.length; i++) {
          pool.push(this.users[i].id);
        }
        this.userData.id = AppComponent.nextId(pool);
        this.users.push({
          id      : this.userData.id,
          login   : this.userData.login,
          passw   : this.userData.passw,
          passw2  : this.userData.passw2,
          name    : this.userData.name,
          email   : this.userData.email,
          enabled : this.userData.enabled
        });
      } else { // редактирование пользователя
        for (let i = 0; i < this.users.length; i++) {
          if (this.users[i].id === this.userData.id) {
            this.users[i].login   = this.userData.login;
            this.users[i].name    = this.userData.name;
            this.users[i].email   = this.userData.email;
            this.users[i].enabled = this.userData.enabled;
            if (this.userData.passw && !this.userData.passw.match(/\s+/)) { // был изменен пароль
              this.users[i].passw = this.users[i].passw2 = this.userData.passw;
            }
            break;
          }
        }
      }
      this.router.navigateByUrl('/users');
    }
  }

  // отмена сохранения
  public cancelSave() : void {
    this.router.navigateByUrl('/users');
  }

  // удалить пользователя
  public removeUser(userId : number) : void {
    if (userId !== this.cuserId && window.confirm('Вы действительно хотите удалить выбранного пользователя?')) { // самого себя нельзя удалять
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].id === userId) {
          this.users.splice(i, 1);
          break;
        }
      }
    }
  }
}
