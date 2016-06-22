(function() {
'use strict';

  angular
    .module('app.auth')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$rootScope', '$location', '$window', '$auth', 'Toast'];
  function LoginController($rootScope, $location, $window, $auth, Toast) {
    var vm = this;
    vm.login = login;
    vm.authenticate = authenticate;

    activate();

    ////////////////

    function activate() { 

    }

    function login() {
      $auth.login(vm.user)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $location.path('/pointBoard');
        })
        .catch(function(response) {
          Toast.show('error', 'Error', response.data);
        });
    }

    function authenticate(provider) {
      $auth.authenticate(provider)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $location.path('/pointBoard');
        })
        .catch(function(response) {
          Toast.show('error', 'Error', response.error || response.data);
        });
    }
  }
})();

// angular.module('app.auth')
//   .controller('LoginCtrl', function($scope, $rootScope, $location, $window, $auth, Toast) {
//     $scope.login = function() {
//       $auth.login($scope.user)
//         .then(function(response) {
//           $rootScope.currentUser = response.data.user;
//           $window.localStorage.user = JSON.stringify(response.data.user);
//           $location.path('/pointBoard');
//         })
//         .catch(function(response) {
//           Toast.show('error', 'Error', response.data);
//         });
//     };

//     $scope.authenticate = function(provider) {
//       $auth.authenticate(provider)
//         .then(function(response) {
//           $rootScope.currentUser = response.data.user;
//           $window.localStorage.user = JSON.stringify(response.data.user);
//           $location.path('/pointBoard');
//         })
//         .catch(function(response) {
//           Toast.show('error', 'Error', response.error || response.data);
//         });
//     };
//   });