angular.module('MyApp')
  .controller('SignupCtrl', function($scope, $rootScope, $location, $window, $auth) {
    $scope.signup = function() {
      $auth.signup($scope.user)
        .then(function(response) {
          $auth.setToken(response);
            $scope.messages = {
              error: Array.isArray(response.data) ? response.data : [response.data]
            };
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    };

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $location.path('/');
        })
        .catch(function(response) {
          if (response.error) {
            $scope.messages = {
              error: [{ msg: response.error }]
            };
          } else if (response.data) {
            $scope.messages = {
              error: [response.data]
            };
          }
        });
    };
  });

  (function() {
  'use strict';
  
    angular
      .module('MyApp')
      .controller('SignupController', SignupController);
  
    SignupController.$inject = ['$rootScope', '$location', '$window', '$auth'];
    function SignupController($rootScope, $location, $window, $auth) {
      var vm = this;
      
      vm.signup = signup;
      vm.authenticate = authenticate;
  
      activate();
  
      ////////////////
  
      function activate() {

       }


      function signup() {
        $auth.signup($scope.user)
        .then(function(response) {
          // redirect the user to some page
          // with some activation message
        })
        .catch(function(response) {
        vm.messages = {
          error: Array.isArray(response.data) ? response.data : [response.data]
        };
        });
      }

    function authenticate(provider) {
      $auth.authenticate(provider)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $location.path('/');
        })
        .catch(function(response) {
          // REFACTOR THIS PART
          if (response.error) {
            $scope.messages = {
              error: [{ msg: response.error }]
            };
          } else if (response.data) {
            $scope.messages = {
              error: [response.data]
            };
          }
        });
      }
    }
  })();