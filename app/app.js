angular.module('MyApp', ['ngRoute', 'satellizer'])
  .config(function($routeProvider, $locationProvider, $authProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        templateUrl: 'partials/home.html'
      })
      .when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/signup', {
        templateUrl: 'partials/signup.html',
        controller: 'SignupController',
        controllerAs: 'vm',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/account', {
        templateUrl: 'partials/profile.html',
        controller: 'ProfileController',
        controllerAs: 'vm',
        resolve: { loginRequired: loginRequired }
      })
      .when('/forgot', {
        templateUrl: 'partials/forgot.html',
        controller: 'ForgotCtrl',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/reset', {
        templateUrl: 'partials/reset.html',
        controller: 'ResetController',
        controllerAs: 'vm',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/activate', {
        templateUrl: 'partials/activate.html',
        controller: 'ActivateController',
        controllerAs: 'vm',
        resolve: { skipIfAuthenticated: skipIfAuthenticated }
      })
      .when('/pointBoard', {
        templateUrl: 'partials/pointBoard.html',
        controller: 'PointController',
        controllerAs: 'vm',
        resolve: { loginRequired: loginRequired }
      })
      .otherwise({
        templateUrl: 'partials/404.html'
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
