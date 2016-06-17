(function(){
  'use strict';

  angular.module('app.config')
    .config(function($routeProvider, $locationProvider, $authProvider) {
      $locationProvider.html5Mode(true);

      $routeProvider
        .when('/', {
          templateUrl: 'layout/home.html',
          controller: 'HomeController',
          controllerAs: 'vm',
        })
        .when('/login', {
          templateUrl: 'auth/login.html',
          controller: 'LoginCtrl',
          resolve: { skipIfAuthenticated: skipIfAuthenticated }
        })
        .when('/signup', {
          templateUrl: 'auth/signup.html',
          controller: 'SignupController',
          controllerAs: 'vm',
          resolve: { skipIfAuthenticated: skipIfAuthenticated }
        })
        .when('/forgot', {
          templateUrl: 'auth/forgot.html',
          controller: 'ForgotCtrl',
          resolve: { skipIfAuthenticated: skipIfAuthenticated }
        })
        .when('/reset', {
          templateUrl: 'auth/reset.html',
          controller: 'ResetController',
          controllerAs: 'vm',
          resolve: { skipIfAuthenticated: skipIfAuthenticated }
        })
        .when('/activate', {
          templateUrl: 'auth/activate.html',
          controller: 'ActivateController',
          controllerAs: 'vm',
          resolve: { skipIfAuthenticated: skipIfAuthenticated }
        })
        .when('/account', {
          templateUrl: 'user/profile.html',
          controller: 'ProfileController',
          controllerAs: 'vm',
          resolve: { loginRequired: loginRequired }
        })
        .when('/pointBoard', {
          templateUrl: 'point-board/point-board.html',
          controller: 'PointController',
          controllerAs: 'vm',
          resolve: { loginRequired: loginRequired }
        })
        .when('/stats', {
          templateUrl: 'stats/stats.html',
          controller: 'StatsController',
          controllerAs: 'vm',
          resolve: { loginRequired: loginRequired }
        })
        .otherwise({
          templateUrl: 'layout/404.html'
        });

      $authProvider.loginUrl = '/login';
      $authProvider.signupUrl = '/signup';

      function skipIfAuthenticated($location, $auth) {
        if ($auth.isAuthenticated()) {
          $location.path('/');
        }
      }

      function loginRequired($location, $auth) {
        if (!$auth.isAuthenticated()) {
          $location.path('/login');
        }
      }
    })
    .run(function($rootScope, $window) {
      if ($window.localStorage.user) {

        $rootScope.currentUser = JSON.parse($window.localStorage.user);
      }
  });
})();