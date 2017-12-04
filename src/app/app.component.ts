import { Component } from '@angular/core';
import { Router } from '@angular/router';

import * as $ from 'jquery/dist/jquery.min.js';

// тип описывает текущего авторизованного пользователя
type CurrentUser = {
  id      : number,
  login   : string,
  name    : string,
  email   : string,
  enabled : boolean
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public static readonly USER_DATA : string = '/assets/db/users.json';
  public static readonly NEWS_DATA : string = '/assets/db/news.json';

  private static _self : AppComponent = null; // синглтон: экземпляр класса AppComponent

  constructor(private router : Router) { // конструктор
    AppComponent._self = this;
  }

  static get self() : AppComponent { // экземпляр класса AppComponent
    return AppComponent._self;
  }

  private _auth  : boolean     = false; // флаг авторизации
  private _users : any[]       = null;  // данные по пользователям
  private _news  : any[]       = null;  // данные по новостям

  private _cuser : CurrentUser = null;  // текущий пользователь

  get authorized() : boolean {
    return this._auth;
  }

  set authorized(auth : boolean) {
    this._auth = auth;
  }

  get users() : any[] {
    return this._users;
  }

  set users(users : any[]) {
    this._users = users;
  }

  get news() : any[] {
    return this._news;
  }

  set news(news : any[]) {
    this._news = news;
  }

  get current_user() : CurrentUser {
    return this._cuser;
  }

  set current_user(cuser : CurrentUser) {
    this._cuser = cuser;
  }

  signOut() : void {
    // очистка session storage
    sessionStorage.removeItem('angular.news.user');

    // сброс авторизации и переход на стартовую страницу
    this.authorized = false;
    this.router.navigateByUrl('/');
  }

  navigateToLogin() : void {
    this.router.navigateByUrl('/');
  }

  // поиск следующего идентификатора в пуле
  static nextId (pool : number[]) : number {
    let id = null;
    if (pool && pool.length > 0) {
      for (id = 1; pool.indexOf(id) !== -1; id++) {}
      pool.push(id);
    }
    return id;
  }
}
