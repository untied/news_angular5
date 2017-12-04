import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { UsersComponent } from './users/users.component';
import { NewsComponent } from './news/news.component';
import { Nl2brPipe } from './nl2br.pipe';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UsersComponent,
    NewsComponent,
    Nl2brPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [{
    provide: 'CheckAuthGuard',
    useValue: () : boolean => {
      if (AppComponent.self.authorized) {
        return true;
      } else {
        let user : any = null;

        try {
          user = JSON.parse(sessionStorage.getItem('angular.news.user'));
        } catch (e) { }
        if (user && user.id) {
          AppComponent.self.authorized   = true;
          AppComponent.self.current_user = {
            id      : parseInt(user.id),
            login   : user.login,
            name    : user.name,
            email   : user.email,
            enabled : user.enabled ? true : false
          };
          return true;
        } else {
          AppComponent.self.navigateToLogin();
          return false;
        }
      }
    }
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
