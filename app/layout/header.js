(function() {
'use strict';

  angular
    .module('app.layout')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$scope', '$location', '$window', '$auth'];
  function HeaderController($scope, $location, $window, $auth) {
    var vm = this;
    vm.isActive = isActive;
    vm.isAuthenticated = isAuthenticated;
    vm.logout = logout;

    activate();

    ////////////////

    function activate() { 
      vm.currentUser = $scope.currentUser;
    }
    
    function isActive(viewLocation) {
      return viewLocation === $location.path();
    }

    function isAuthenticated() {
      return $auth.isAuthenticated();
    }

    function logout() {
      $auth.logout();
      delete $window.localStorage.user;
      $location.path('/');
    }
  }
})();

// angular.module('app.layout')
//   .controller('HeaderCtrl', function($scope, $location, $window, $auth) {
//     $scope.isActive = function (viewLocation) {
//       return viewLocation === $location.path();
//     };

//     $scope.isAuthenticated = function() {
//       return $auth.isAuthenticated();
//     };

//     $scope.logout = function() {
//       $auth.logout();
//       delete $window.localStorage.user;
//       $location.path('/');
//     };


//   });