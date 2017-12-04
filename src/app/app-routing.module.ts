import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { NewsComponent } from './news/news.component';
import { UsersComponent } from './users/users.component';

const routes : Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'news',
    children: [{
      path: '',
      component: NewsComponent
    }, {
      path: 'create',
      component: NewsComponent
    }, {
      path: 'modify/:id',
      component: NewsComponent
    }],
    canActivate: ['CheckAuthGuard']
  },
  {
    path: 'users',
    children: [{
      path: '',
      component: UsersComponent
    }, {
      path: 'create',
      component: UsersComponent
    }, {
      path: 'modify/:id',
      component: UsersComponent
    }],
    canActivate: ['CheckAuthGuard']
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
