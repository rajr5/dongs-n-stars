angular.module('app.auth')
  .controller('LoginCtrl', function($scope, $rootScope, $location, $window, $auth, Toast) {
    $scope.login = function() {
      $auth.login($scope.user)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $location.path('/pointBoard');
        })
        .catch(function(response) {
          Toast.show('error', 'Error', response.data);
        });
    };

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $location.path('/pointBoard');
        })
        .catch(function(response) {
          Toast.show('error', 'Error', response.error || response.data);
        });
    };
  });