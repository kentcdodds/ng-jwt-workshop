import {Component, Template} from 'angular2/angular2';
import {If} from 'angular2/angular2';
import {bind} from 'angular2/di';
import {global} from 'angular2/src/facade/lang';
import {SignIn} from 'sign-in';
import {Alert} from 'alert';
import {log} from 'log';

const store = global.localStorage;

@Component({
  selector: 'app',
  services: [
    Alert,
    bind(axios).toValue(axios),
    bind(log).toFactory(() => log)
  ]
})
@Template({
  inline: `
    <div *if="!user">
      <sign-in (loginSuccess)="onSuccessfulLogin(user)"></sign-in>
    </div>

    <div *if="user">
      hey!
      <main [user]="user"></main>
    </div>
  `,
  directives: [If, SignIn]
})
export class App {
  constructor($http:axios, alert:Alert, myLog:log) {
    this.$http = $http;
    this.apiBase = 'http://api.jwtftw.dev:3000/';
    this.store = store;
    this.tokenKey = 'user-token';
    myLog('hey');
    alert.alert('what\s up!');
  }

  onSuccessfulLogin(user) {
    console.log('hey!');
    this.user = user;
  }
}
