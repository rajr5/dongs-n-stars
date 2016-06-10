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

// angular.module('MyApp')
//   .controller('ContactCtrl', function($scope, Contact) {
//     $scope.sendContactForm = function() {
//       Contact.send($scope.contact)
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
//     }
//   });
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

  PointController.$inject = ['$timeout', 'Point', 'Account'];
  function PointController($timeout, Point, Account) {
    var vm = this;

    vm.userPoints = null;
    vm.dongs = [];
    vm.rockstars = [];
    vm.recent = [];

    vm.getUsersPoints = getUsersPoints;
    vm.createUserPoint = createUserPoint;
    vm.removeUserPoint = removeUserPoint;

    activate();

    ////////////////

    function activate() {
      getUsersPoints();
      getRecent();
    }

    function getUsersPoints() {
      Point.getUsersPoints()
      .then(function(userPoints) {
        vm.userPoints = userPoints.data.userPoints;
        setPoints();
      })
      .catch(function(response){
        setMsg(response.data, true);
      });
      Account.getUsers()
      .then(function(users) {
        vm.users = users.data;
      })
      .catch(function(response){
        setMsg(response.data, true);
      });
    }

    /**
     * ADD user point
     */
    function createUserPoint(toUser, pointType) {
      var data = {
        pointType: pointType,
        toUser: toUser
      };
      Point.createPoint(data)
      .then(function(userPoints) {
        enrichRecent([userPoints.data.userVote]);
        vm.recent.push(userPoints.data.userVote);
        getUsersPoints();
        setMsg(userPoints.data, false);
      })
      .catch(function(response){
        setMsg(response.data, true);
      });
    }

    /**
     * REMOVE user point
     */
    function removeUserPoint(toUser, pointType) {
      var data = {
        pointType: pointType,
        toUser: toUser
      };
      Point.removePoint(toUser, pointType)
      .then(function(userPoints) {
        enrichRecent([userPoints.data.userVote]);
        vm.recent.push(userPoints.data.userVote);
        getUsersPoints();
        setMsg(userPoints.data, false);
      })
      .catch(function(response){
        setMsg(response.data, true);
      });
    }

    function setPoints() {
      vm.dongs = [];
      vm.rockstars = [];
      setDongs(vm.userPoints);
      setRockstars(vm.userPoints);
    }

    function getRecent() {
      vm.recent = [];
      // get recent
      // update recent obj
      Point.getUserVotes()
      .then(function(recent) {
        enrichRecent(recent.data.userVotes);
        vm.recent = recent.data.userVotes;
      })
      .catch(function(err){
      });
    }

    function enrichRecent(userVotes) {
      userVotes.map((currVal) => {
        if (currVal.dong === -1 || currVal.rockstars === -1) {
          currVal.verb = 'removed';
          currVal.class = 'label label-info';
        } else {
          currVal.verb = 'gave';
          currVal.class = 'label label-warning';
        }
      });
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
    }

    function setMsg(msg, isError) {
      if(!Array.isArray(msg)) {
        msg = [msg];
      }
      if (!isError) {
        vm.messages = {
          success: msg
        };
      } else {
        vm.messages = {
          error: msg
        };
      }
      if (vm.toPromise) {
        $timeout.cancel(vm.toPromise);
      }
      vm.toPromise = $timeout(()=>{
        vm.messages = {};
      }, 2000, true);
    }

  }
})();
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

    function changePassword(password, confirm) {
      vm.profile.password = password || null;
      vm.profile.confirm = confirm || null;
      Account.changePassword(vm.profile)
        .then(function(response) {
          console.log('response', response);
          vm.messages = {
            success: [response.data]
          };
          delete vm.password;
          delete vm.confirm;
        })
        .catch(function(response) {
          console.log('response', response);
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
// angular.module('MyApp')
//   .factory('Contact', function($http) {
//     return {
//       send: function(data) {
//         return $http.post('/contact', data);
//       }
//     };
//   });
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
      getUserVotes: function(id, query) {
        var options = {};
        options.query = query;
        return $http.get('/userVotes', options);
      },
      createPoint: function(data) {
        return $http.post('/point', data);
      },
      removePoint: function(toUser, pointType, query) {
        var options = {};
        options.query = query || {};
        return $http.delete('/point/'+toUser+'/'+pointType, options);
      }
    };
  }]);
