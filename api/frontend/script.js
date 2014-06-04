(function() {
  var app = angular.module('ng.jwt.workshop', []);
  
  app.constant('API_BASE', 'http://localhost:3000/');
  
  app.controller('MainCtrl', function($scope, $http, API_BASE, $timeout) {

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

    $scope.getMe();

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
        $scope.user = response.data;
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
        $scope.funnyPictureUrl = API_BASE + 'funny-pic';
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
})();
