(function() {
  var app = angular.module('ng.jwt.workshop', []);
  
  app.constant('API_BASE', 'http://api.jwtftw.dev:3000/');
  app.factory('AuthToken', function($window) {
    var tokenKey = 'user-token';
    var storage = $window.localStorage;
    var cachedToken;
    return {
      isAuthenticated: isAuthenticated,
      setToken: setToken,
      getToken: getToken,
      clearToken: clearToken
    };
    function setToken(token) {
      cachedToken = token;
      storage.setItem(tokenKey, token);
    }
    function getToken() {
      if (!cachedToken) {
        cachedToken = storage.getItem(tokenKey);
      }
      return cachedToken;
    }
    function clearToken() {
      cachedToken = null;
      storage.removeItem(tokenKey);
    }
    function isAuthenticated() {
      return !!getToken();
    }
  });

  app.factory('AuthInterceptor', function ($rootScope, $q, AuthToken) {
    return {
      request: function (config) {
        var token = AuthToken.getToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = 'Bearer ' + token;
        }
        return config;
      },
      response: function (response) {
        if (response.status === 401) {
          console.warn('user not authenticated', response);
          // handle the case where the user is not authenticated
        }
        return response || $q.when(response);
      }
    };
  });
  
  app.controller('MainCtrl', function($scope, $http, API_BASE, $timeout, AuthToken, $window) {

    $scope.getMe = function() {
      $http.get(API_BASE + 'users/me').then(function success(response) {
        $scope.user = response.data;
        $scope.alreadyLoggedIn = true;
        showAlert('info', 'Hello', 'and welcome back ' + $scope.user.username + '!');
      }, function error() {
        console.log('getting user error', arguments);
      }).finally(function() {
        $scope.meRequestComplete = true;
      });
    };

    if (AuthToken.isAuthenticated()) {
      $scope.getMe();
    } else {
      $scope.meRequestComplete = true;
    }

    $scope.login = function(username, password) {
      $scope.badCreds = false;
      $http({
        url: API_BASE + 'login',
        method: 'POST',
        data: {
          username: username,
          password: password
        }
      }).then(function success(response) {
        AuthToken.setToken(response.data.token);
        $scope.user = response.data.user;
        $scope.noPicture = true;
        showAlert('success', 'Hey there!', 'Welcome ' + $scope.user.username + '!');
      }, function error(response) {
        if (response.status === 404) {
          $scope.badCreds = true;
          showAlert('danger', 'Whoops...', 'Do I know you?');
        } else {
          showAlert('danger', 'Hmmm....', 'Problem logging in! Sorry!');
        }
      });
    };
    $scope.toggleFunnyPicture = function() {
      $scope.noPicture = false;
      if ($scope.funnyPictureUrl) {
        $scope.funnyPictureUrl = null;
      } else {
        $scope.funnyPictureUrl = API_BASE + 'funny-pic?access_token=' + $window.encodeURIComponent(AuthToken.getToken());
      }
    };

    $scope.logout = function() {
      $scope.funnyPictureUrl = null;
      $http.get(API_BASE + 'logout').then(function() {
        $scope.user = null;
        showAlert('info', 'Goodbye!', 'Have a great day!');
      }, function() {
        showAlert('danger', 'Uh oh!', 'Error logging out! Sorry!');
        console.log('logout error', arguments);
      });
    };

    var alertTimeout;
    function showAlert(type, title, message) {
      $scope.alert = {
        hasBeenShown: true,
        show: true,
        type: type,
        message: message,
        title: title
      };
      $timeout.cancel(alertTimeout);
      alertTimeout = $timeout(function() {
        $scope.alert.show = false;
      }, 1500);
    }
  });

  app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  });
})();
