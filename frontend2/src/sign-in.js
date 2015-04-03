import {Component, Template, EventEmitter} from 'angular2/angular2';
import {bind} from 'angular2/di';
import {global} from 'angular2/src/facade/lang';

const store = global.localStorage;
const axiosService = bind(axios).toValue(axios);

@Component({
  selector: 'sign-in',
  services: [axiosService]
})
@Template({
  inline: `
    <form (submit)="login($event, username.value, password.value)">
      <input type="text" placeholder="Username" #username value="kentcdodds">
      <input type="password" placeholder="Password" #password value="iliketwix">
      <button type="submit">Sign In</button>
    </form>
  `,
  directives: []
})
export class SignIn {
  constructor($http:axios, @EventEmitter('loginsuccess') loginSuccess:Function) {
    this.$http = $http;
    this.apiBase = 'http://api.jwtftw.dev:3000/';
    this.store = store;
    this.tokenKey = 'user-token';
    this.loginSuccess = loginSuccess;
  }

  login(event, username, password) {
    event.preventDefault();
    this.$http({
      url: this.apiBase + 'login',
      method: 'POST',
      data: {
        username: username,
        password: password
      }
    }).then(response => {
      this.store.setItem(this.tokenKey, response.data.token);
      this.loginSuccess(response.data.user);
    });
  }
}
