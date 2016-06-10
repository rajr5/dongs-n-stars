angular.module('MyApp', ['ngRoute', 'satellizer'])
  .config(["$routeProvider", "$locationProvider", "$authProvider", function($routeProvider, $locationProvider, $authProvider) {
    skipIfAuthenticated.$inject = ["$location", "$auth"];
    loginRequired.$inject = ["$location", "$auth"];
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
        controller: 'SignupCtrl',
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
  }])
  .run(["$rootScope", "$window", function($rootScope, $window) {
    if ($window.localStorage.user) {
      $rootScope.currentUser = JSON.parse($window.localStorage.user);
    }
  }]);

angular.module('MyApp')
  .controller('ContactCtrl', ["$scope", "Contact", function($scope, Contact) {
    $scope.sendContactForm = function() {
      Contact.send($scope.contact)
        .then(function(response) {
          $scope.messages = {
            success: [response.data]
          };
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    }
  }]);
angular.module('MyApp')
  .controller('ForgotCtrl', ["$scope", "Account", function($scope, Account) {
    $scope.forgotPassword = function() {
      Account.forgotPassword($scope.user)
        .then(function(response) {
          $scope.messages = {
            success: [response.data]
          };
        })
        .catch(function(response) {
          $scope.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    }
  }]);
angular.module('MyApp')
  .controller('HeaderCtrl', ["$scope", "$location", "$window", "$auth", function($scope, $location, $window, $auth) {
    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
    
    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
    
    $scope.logout = function() {
      $auth.logout();
      delete $window.localStorage.user;
      $location.path('/');
    };
  }]);
angular.module('MyApp')
  .controller('LoginCtrl', ["$scope", "$rootScope", "$location", "$window", "$auth", function($scope, $rootScope, $location, $window, $auth) {
    $scope.login = function() {
      $auth.login($scope.user)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $location.path('/account');
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
  }]);
(function() {
'use strict';

  angular
    .module('MyApp')
    .controller('PointController', PointController);

  PointController.$inject = ['Point', 'Account'];
  function PointController(Point, Account) {
    var vm = this;

    vm.createdUserPoints = [];
    vm.userPoints = null;
    vm.dongs = [];
    vm.rockstars = [];
    vm.recent = [];

    vm.getUsersPoints = getUsersPoints;
    vm.createUserPoint = createUserPoint;

    activate();

    ////////////////

    function activate() {
      getUsersPoints();

    }

    function getUsersPoints() {
      Point.getUsersPoints()
      .then(function(userPoints) {
        console.log('userPoints', userPoints);
        vm.userPoints = userPoints.data.userPoints;
        setPoints();
      })
      .catch(function(err){
        console.log('error!');
      });
      Account.getUsers()
      .then(function(users) {
        console.log('users', users);
        vm.users = users.data;
      })
      .catch(function(err){
        console.log('error', err);
      });
    }

    function createUserPoint(toUser, pointType) {
      var data = {
        pointType: pointType,
        toUser: toUser
      };
      console.log('data', data);
      Point.createPoint(data)
      .then(function(userPoints) {
        console.log('userPoints', userPoints);
        vm.createdUserPoints.push(userPoints.data.userPoints);
        activate();
      })
      .catch(function(err){
        console.log('error!');
      });
    }

    function setPoints() {
      vm.dongs = [];
      vm.rockstars = [];
      vm.recent = [];
      console.log('vm.userPoints', vm.userPoints);
      setDongs(vm.userPoints);
      setRockstars(vm.userPoints);
      setRecent(vm.userPoints);
    }

    function setDongs(userPoints) {
      userPoints.forEach((up) => {
        if (up.dongs.length > 0) {
          vm.dongs.push({
            toUser: up.user._id,
            name: up.user.name,
            email: up.user.email,
            allDongs: up.dongs,
            count: up.dongs.length
          });
        }
      });
      console.log(vm.dongs);
    }

    function setRockstars(userPoints) {
      userPoints.forEach((up) => {
        if (up.rockstars.length > 0) {
          vm.rockstars.push({
            toUser: up.user._id,
            name: up.user.name,
            email: up.user.email,
            allRockstars: up.rockstars,
            count: up.rockstars.length
          });
        }
      });
      console.log(vm.rockstars);
    }

    function setRecent(userPoints) {
      userPoints.forEach((up) => {
        up.dongs.forEach((d) => {
          vm.recent.push({
            type: 'dong',
            isDong: true,
            isRockstar: false,
            from: d.fromUser.name,
            to: up.user.name,
            date: d.createdAt
          });
        });
        up.rockstars.forEach((d) => {
          vm.recent.push({
            type: 'rockstar',
            isDong: false,
            isRockstar: true,
            from: d.fromUser.name,
            to: up.user.name,
            date: d.createdAt
          });
        });
      });
      console.log('recent', vm.recent);
    }

  }
})();
// angular.module('MyApp')
//   .controller('ProfileCtrl', function($scope, $rootScope, $location, $window, $auth, Account) {
//     $scope.profile = $rootScope.currentUser;

//     $scope.updateProfile = function() {
//       Account.updateProfile($scope.profile)
//         .then(function(response) {
//           $rootScope.currentUser = response.data.user;
//           $window.localStorage.user = JSON.stringify(response.data.user);
//           $scope.messages = {
//             success: [response.data]
//           };
//         })
//         .catch(function(response) {
//           $scope.messages = {
//             error: Array.isArray(response.data) ? response.data : [response.data]
//           };
//         });
//     };

//     $scope.changePassword = function() {
//       Account.changePassword($scope.profile)
//         .then(function(response) {
//           $scope.messages = {
//             success: [response.data]
//           };
//         })
//         .catch(function(response) {
//           $scope.messages = {
//             error: Array.isArray(response.data) ? response.data : [response.data]
//           };
//         });
//     };

//     $scope.link = function(provider) {
//       $auth.link(provider)
//         .then(function(response) {
//           $scope.messages = {
//             success: [response.data]
//           };
//         })
//         .catch(function(response) {
//           $window.scrollTo(0, 0);
//           $scope.messages = {
//             error: [response.data]
//           };
//         });
//     };
//     $scope.unlink = function(provider) {
//       $auth.unlink(provider)
//         .then(function() {
//           $scope.messages = {
//             success: [response.data]
//           };
//         })
//         .catch(function(response) {
//           $scope.messages = {
//             error: [response.data]
//           };
//         });
//     };

//     $scope.deleteAccount = function() {
//       Account.deleteAccount()
//         .then(function() {
//           $auth.logout();
//           delete $window.localStorage.user;
//           $location.path('/');
//         })
//         .catch(function(response) {
//           $scope.messages = {
//             error: [response.data]
//           };
//         });
//     };
//   });


  (function() {
  'use strict';

    angular
      .module('MyApp')
      .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['$rootScope', '$location', '$window', '$auth', 'Account',];
    function ProfileController($rootScope, $location, $window, $auth, Account) {
      var vm = this;
      vm.profile = $rootScope.currentUser;
      vm.updateProfile = updateProfile;
      vm.changePassword = changePassword;
      vm.deleteAccount = deleteAccount;

      activate();

      ////////////////

      function activate() {
        delete vm.profile.password;
      }

    function updateProfile() {
      delete vm.profile.password;
      Account.updateProfile(vm.profile)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          vm.messages = {
            success: [response.data]
          };
        })
        .catch(function(response) {
          vm.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    }

    function changePassword(password, confirmPassword) {
      Account.changePassword(vm.profile)
        .then(function(response) {
          vm.messages = {
            success: [response.data]
          };
          delete vm.password;
          delete vm.confirm;
        })
        .catch(function(response) {
          vm.messages = {
            error: Array.isArray(response.data) ? response.data : [response.data]
          };
        });
    }

    function deleteAccount() {
      Account.deleteAccount()
        .then(function() {
          $auth.logout();
          delete $window.localStorage.user;
          $location.path('/');
        })
        .catch(function(response) {
          vm.messages = {
            error: [response.data]
          };
        });
    }

    }
  })();
angular.module('MyApp')
  .controller('ResetCtrl', ["$scope", "Account", function($scope, Account) {
    Account.forgotPassword($scope.user)
      .then(function(response) {
        $scope.messages = {
          success: [response.data]
        };
      })
      .catch(function(response) {
        $scope.messages = {
          error: Array.isArray(response.data) ? response.data : [response.data]
        };
      });
  }]);
angular.module('MyApp')
  .controller('SignupCtrl', ["$scope", "$rootScope", "$location", "$window", "$auth", function($scope, $rootScope, $location, $window, $auth) {
    $scope.signup = function() {
      $auth.signup($scope.user)
        .then(function(response) {
          $auth.setToken(response);
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          $location.path('/');
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
  }]);
angular.module('MyApp')
  .factory('Account', ["$http", function($http) {
    return {
      updateProfile: function(data) {
        return $http.put('/account', data);
      },
      changePassword: function(data) {
        return $http.put('/account', data);
      },
      deleteAccount: function() {
        return $http.delete('/account');
      },
      forgotPassword: function(data) {
        return $http.post('/forgot', data);
      },
      resetPassword: function(data) {
        return $http.post('/reset', data);
      },
      getUsers: function(data) {
        return $http.get('/users', data);
      }
    };
  }]);
angular.module('MyApp')
  .factory('Contact', ["$http", function($http) {
    return {
      send: function(data) {
        return $http.post('/contact', data);
      }
    };
  }]);
angular.module('MyApp')
  .factory('Point', ["$http", function($http) {
    return {
      getUsersPoints: function(query) {
        var options = {};
        options.query = query;
        return $http.get('/userPoints', options);
      },
      getUserPoints: function(id, query) {
        var options = {};
        options.query = query;
        return $http.get('/userPoints/'+id, options);
      },
      createPoint: function(data) {
        return $http.post('/point', data);
      }
    };
  }]);
