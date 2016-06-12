(function() {
  'use strict';

  angular.module('app', [
    /** Application Modules */
    'app.config','app.auth', 'app.layout', 'app.services', 'app.user', 'app.point-board','app.templates'

    /** 3rd Party Modules */

  ]);
})();
(function() {
  'use strict';

  angular.module('app.layout', [

  ]);
})();
(function() {
  'use strict';

  angular.module('app.templates', [

  ]);
})();
(function() {
  'use strict';

  angular.module('app.auth', [

  ]);
})();
(function() {
  'use strict';

  angular.module('app.point-board', [

  ]);
})();
(function() {
  'use strict';

  angular.module('app.services', [

  ]);
})();
(function() {
  'use strict';

  angular.module('app.user', [

  ]);
})();
angular.module('app.config', ['ngRoute', 'satellizer'])
  .config(["$routeProvider", "$locationProvider", "$authProvider", function($routeProvider, $locationProvider, $authProvider) {
    skipIfAuthenticated.$inject = ["$location", "$auth"];
    loginRequired.$inject = ["$location", "$auth"];
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        templateUrl: 'layout/home.html'
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
  }])
  .run(["$rootScope", "$window", function($rootScope, $window) {
    if ($window.localStorage.user) {
      $rootScope.currentUser = JSON.parse($window.localStorage.user);
    }
  }]);

angular.module('app.layout')
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
(function() {
'use strict';

  angular
    .module('app.auth')
    .controller('ActivateController', ActivateController);

  ActivateController.$inject = ['$rootScope', '$location', '$window', '$auth', 'Account'];
  function ActivateController($rootScope, $location, $window, $auth, Account) {
    var vm = this;

    activate();

    ////////////////

    function activate() {
      activateAccount();
    }

    function activateAccount() {
      // Call out to server
      // activate account
      // log account in
      // look into satellizer api docs
      var token = $location.search().token;
      Account.activateAccount(token)
      .then((response) => {
        $auth.setToken(response);
        $rootScope.currentUser = response.data.user;
        $window.localStorage.user = JSON.stringify(response.data.user);
        $location.path('/');
      })
      .catch((err) => {
        if (err.error) {
          vm.messages = {
            error: [{ msg: err.error }]
          };
        } else if (err.data) {
          vm.messages = {
            error: [err.data]
          };
        }
      });
    }
  }
})();
(function() {
  'use strict';

  angular.module('app.auth', [

  ]);
})();
angular.module('app.auth')
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
angular.module('app.auth')
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
    .module('app.auth')
    .controller('ResetController', ResetController);

  ResetController.$inject = ['$rootScope', '$location', '$window', '$auth', 'Account'];
  function ResetController($rootScope, $location, $window, $auth, Account) {
    var vm = this;

    vm.resetPassword = resetPassword;

    activate();

    ////////////////

    function activate() {

      }

    function resetPassword() {
      var token = $location.search().token;
      Account.resetPassword(token, vm.user)
      .then((response) => {
        $auth.setToken(response);
        $rootScope.currentUser = response.data.user;
        $window.localStorage.user = JSON.stringify(response.data.user);
        $location.path('/');
      })
      .catch((err) => {
        vm.messages= {
          error: Array.isArray(err.data) ? err.data : [err.data]
        };
      });
    }
  }
})();

(function() {
'use strict';

  angular
    .module('app.auth')
    .controller('SignupController', SignupController);

  SignupController.$inject = ['$rootScope', '$location', '$window', '$auth'];
  function SignupController($rootScope, $location, $window, $auth) {
    var vm = this;

    vm.signup = signup;

    activate();

    ////////////////

    function activate() {

      }


    function signup() {
      $auth.signup(vm.user)
      .then(function(response) {
        vm.user = null;
        vm.messages = {
          success: Array.isArray(response.data) ? response.data : [response.data]
        };
      })
      .catch(function(response) {
      vm.messages = {
        error: Array.isArray(response.data) ? response.data : [response.data]
      };
      });
    }
  }
})();
(function() {
'use strict';

  angular
    .module('app.point-board')
    .controller('PointController', PointController);

  PointController.$inject = ['$timeout', 'Point', 'Account'];
  function PointController($timeout, Point, Account) {
    var vm = this;

    vm.userPoints = null;
    vm.dongs = [];
    vm.rockstars = [];
    vm.recent = [];
    vm.pointType = 'dong';

    vm.setPointType = setPointType;
    vm.getUsersPoints = getUsersPoints;
    vm.createUserPoint = createUserPoint;
    vm.removeUserPoint = removeUserPoint;
    vm.selectUser = selectUser;

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

    function selectUser(user) {
      vm.user = user;
    }

    function setPointType(pointType) {
      vm.pointType = pointType;
    }

    /**
     * ADD user point
     */
    function createUserPoint(toUser, pointType) {
      if (!toUser) {
        setMsg({msg: 'You must select a user'}, true);
      } else {
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
          vm.user = null;
        })
        .catch(function(response){
          setMsg(response.data, true);
          vm.user = null;
        });
      }
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
        if (currVal.dong === -1 || currVal.rockstar === -1) {
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
angular.module('app.services')
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
      resetPassword: function(token, data) {
        return $http.post('/reset/'+token, data);
      },
      activateAccount: function(token, data) {
        return $http.post('/activate/'+token, data);
      },
      getUsers: function(data) {
        return $http.get('/users', data);
      }
    };
  }]);
angular.module('app.services')
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

(function() {
  'use strict';

    angular
      .module('app.user')
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