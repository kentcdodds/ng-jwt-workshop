(function() {
  var app = angular.module('ng.jwt.workshop', []);
  
  app.constant('API_BASE', 'http://api.local.dev:3000/');
  
  app.controller('MainCtrl', function($scope, $http, API_BASE) {
    $scope.login = function(username, password) {
      $http({
        url: API_BASE + 'login',
        method: 'POST',
        data: {
          username: username,
          password: password
        }
      }).then(function success() {
        console.log('login success', arguments);
      }, function error() {
        console.log('login error', arguments);
      });
    }
  });
})();
