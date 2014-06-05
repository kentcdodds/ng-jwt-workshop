(function() {
  var app = angular.module('ng.jwt.workshop', []);

  app.constant('Firebase', Firebase);
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
  
  app.controller('MainCtrl', function($scope, $http, API_BASE, $timeout, AuthToken, $window, Firebase) {

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

    $scope.sendFeedback = function(feedback) {
      var d = new Date();
      var formattedDate = d.getFullYear() + '-' + addZero(d.getMonth() + 1) + '-' + addZero(d.getDate());
      var url = 'https://ng-jwt-workshop.firebaseio.com/' + formattedDate;
      var feedbackRef = new Firebase(url);
      feedbackRef.push(feedback);
      showAlert('info', 'Sent!', 'Thanks for the feedback!');
      $scope.showFeedback = false;
    };
    function addZero(num) {
      return (num < 10 ? '0' : '') + num;
    }

    $scope.showAppropriateAlertForScore = function(feedback) {
      if (feedback.score !== 0 && !feedback.score) {
        return;
      }
      var timeout = 5000;
      if (feedback.score <= 3) {
        showAlert('danger', ['Ouch', feedback.name].join(' ').trim() + '!', 'That hurt... I hope next time I can do better for you... Suggestions welcome.', timeout);
      } else if (feedback.score <= 6) {
        showAlert('warning', ['Huh', feedback.name].join(' ').trim() + '...', 'I appreciate any constructive suggestions you have!', timeout);
      } else if (feedback.score <= 9) {
        showAlert('info', ['Great', feedback.name].join(' ').trim() + '!', 'Much appreciated, I\'d love to know what I can improve to make it perfect!', timeout);
      } else {
        showAlert('success', ['Wow', feedback.name].join(' ').trim() + '!', 'Gee! Thanks for the perfect score! What made it so good?', timeout);
      }
    };

    var alertTimeout;
    function showAlert(type, title, message, timeout) {
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
      }, timeout || 1500);
    }
  });

  app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  });
})();
