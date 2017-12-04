import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AppComponent } from '../app.component';

import * as $ from 'jquery/dist/jquery.min.js';

enum NewsMode { // возможные режимы работы компонента
  list,   // список сообщений
  create, // создание нового сообщения
  modify  // редактирование сообщения
}

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {
  public NewsMode = NewsMode;

  public mode : NewsMode = null; // текущий режим контроллера
  public news : any[]    = null; // список новостей

  public newsData = {
    id      : -1,
    date    : '',
    subject : '',
    message : '',
    enabled : true
  };

  public isRevealed : boolean = false;

  // конструктор
  constructor(private router : Router, private route : ActivatedRoute) {
    this.route.params.subscribe(res => this.newsData.id = res.id ? parseInt(res.id) : -1);
  }

  ngOnInit() {
    // загрузка списка новостей при необходимости
    if (this.news === null) {
      if (AppComponent.self.news !== null) {
        this.news = AppComponent.self.news;
      } else {
        $.ajax(AppComponent.NEWS_DATA, {
          method: 'GET',
          dataType: 'json',
          success: (data : any[]) => {
            AppComponent.self.news = this.news = data;
          }
        });
      }
    }
    if (this.router.url === '/news') {
      this.mode = NewsMode.list;
    } else {
      this.newsData.date    = NewsComponent.formatDate(new Date());
      this.newsData.subject = '';
      this.newsData.message = '';
      this.newsData.enabled = true;
      if (this.router.url === '/news/create') {
        this.mode = NewsMode.create;
        this.newsData.id = -1;
      } else {
        this.mode = NewsMode.modify;
        if (this.newsData.id != -1) {
          for (let i = 0; i < this.news.length; i++) {
            if (this.news[i].id === this.newsData.id) {
              this.newsData.date    = this.news[i].date;
              this.newsData.subject = this.news[i].subject;
              this.newsData.message = this.news[i].message;
              this.newsData.enabled = this.news[i].enabled;
              break;
            }
          }
        }
      }
    }
  }

  private static formatDate(dt : Date) : string {
    let year  = dt.getFullYear(),
        month = dt.getMonth() + 1,
        date  = dt.getDate();
    return `${date > 9 ? date : '0' + date}.${month > 9 ? month : '0' + month}.${year}`;
  }

  // включить/выключить новость
  public setEnabled(newsId : number, enabled : boolean) : void {
    for (let i = 0; i < this.news.length; i++) {
      if (this.news[i].id === newsId) {
        this.news[i].enabled = enabled;
        break;
      }
    }
  }

  // отобразить preview новости
  public revealNews(newsId : number) : void {
    let found = false;
    for (let i = 0; i < this.news.length; i++) {
      if (this.news[i].id === newsId) {
        this.newsData.id      = this.news[i].id;
        this.newsData.date    = this.news[i].date;
        this.newsData.subject = this.news[i].subject;
        this.newsData.message = this.news[i].message;
        this.newsData.enabled = this.news[i].enabled;
        found = true;
        break;
      }
    }
    if (found) {
      this.isRevealed = true;
    }
  }

  // скрыть preview новости
  public vanishNews() : void {
    this.newsData.id      = -1;
    this.newsData.date    = '';
    this.newsData.subject = '';
    this.newsData.message = '';
    this.newsData.enabled = true;
    this.isRevealed       = false;
  }

  public onPreviewClick(evt : Event) : void {
    evt.stopPropagation();
    evt.preventDefault();
  }

  // редактировать новость
  public modifyNews(newsId : number) : void {
    this.router.navigateByUrl(`/news/modify/${newsId}`);
  }

  // сохранение новости
  public saveNews() : void {
    if (!this.newsData.subject) {
      window.alert('Пожалуйста, введите корректно заголовок новости!')
      return
    }
    if (!this.newsData.message) {
      window.alert('Пожалуйста, введите корректно текст сообщения новости!')
      return
    }
    if (window.confirm('Вы действительно хотите сохранить информацию о новости?')) {
      if (this.mode === NewsMode.create) { // создание новости
        let pool : number[] = [];
        for (let i = 0; i < this.news.length; i++) {
          pool.push(this.news[i].id);
        }
        this.newsData.id   = AppComponent.nextId(pool);
        this.newsData.date = NewsComponent.formatDate(new Date());
        this.news.unshift({
          id      : this.newsData.id,
          date    : this.newsData.date,
          subject : this.newsData.subject,
          message : this.newsData.message,
          enabled : this.newsData.enabled
        });
      } else { // редактирование новости
        for (let i = 0; i < this.news.length; i++) {
          if (this.news[i].id === this.newsData.id) {
            this.news[i].subject = this.newsData.subject;
            this.news[i].message = this.newsData.message;
            this.news[i].enabled = this.newsData.enabled;
            break;
          }
        }
      }
      this.router.navigateByUrl('/news');
    }
  }

  // отмена сохранения
  public cancelSave() : void {
    this.router.navigateByUrl('/news');
  }

  // удалить новость
  public removeNews(newsId : number) : void {
    if (window.confirm('Вы действительно хотите удалить выбранную новость?')) {
      for (let i = 0; i < this.news.length; i++) {
        if (this.news[i].id === newsId) {
          this.news.splice(i, 1);
          break;
        }
      }
    }
  }
}
