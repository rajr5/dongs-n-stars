'use strict';

(function () {
  'use strict';

  angular.module('app', [
  /** Application Modules */
  'app.config', 'app.auth', 'app.layout', 'app.services', 'app.user', 'app.point-board', 'app.templates']);
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.config', ['ngRoute', 'satellizer']);
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.auth', []);
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.layout', []);
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.templates', []);
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.point-board', []);
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.services', []);
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.user', []);
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.config').config(["$routeProvider", "$locationProvider", "$authProvider", function ($routeProvider, $locationProvider, $authProvider) {
    skipIfAuthenticated.$inject = ["$location", "$auth"];
    loginRequired.$inject = ["$location", "$auth"];
    $locationProvider.html5Mode(true);

    $routeProvider.when('/', {
      templateUrl: 'layout/home.html',
      controller: 'HomeController',
      controllerAs: 'vm'
    }).when('/login', {
      templateUrl: 'auth/login.html',
      controller: 'LoginCtrl',
      resolve: { skipIfAuthenticated: skipIfAuthenticated }
    }).when('/signup', {
      templateUrl: 'auth/signup.html',
      controller: 'SignupController',
      controllerAs: 'vm',
      resolve: { skipIfAuthenticated: skipIfAuthenticated }
    }).when('/forgot', {
      templateUrl: 'auth/forgot.html',
      controller: 'ForgotCtrl',
      resolve: { skipIfAuthenticated: skipIfAuthenticated }
    }).when('/reset', {
      templateUrl: 'auth/reset.html',
      controller: 'ResetController',
      controllerAs: 'vm',
      resolve: { skipIfAuthenticated: skipIfAuthenticated }
    }).when('/activate', {
      templateUrl: 'auth/activate.html',
      controller: 'ActivateController',
      controllerAs: 'vm',
      resolve: { skipIfAuthenticated: skipIfAuthenticated }
    }).when('/account', {
      templateUrl: 'user/profile.html',
      controller: 'ProfileController',
      controllerAs: 'vm',
      resolve: { loginRequired: loginRequired }
    }).when('/pointBoard', {
      templateUrl: 'point-board/point-board.html',
      controller: 'PointController',
      controllerAs: 'vm',
      resolve: { loginRequired: loginRequired }
    }).otherwise({
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
  }]).run(["$rootScope", "$window", function ($rootScope, $window) {
    if ($window.localStorage.user) {

      $rootScope.currentUser = JSON.parse($window.localStorage.user);
    }
  }]);
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.auth').controller('ActivateController', ActivateController);

  ActivateController.$inject = ['$rootScope', '$location', '$window', '$auth', 'Account', 'Socket'];
  function ActivateController($rootScope, $location, $window, $auth, Account, Socket) {
    var vm = this;

    activate();

    ////////////////

    function activate() {
      activateAccount();
    }

    function activateAccount() {
      var token = $location.search().token;
      Account.activateAccount(token).then(function (response) {
        Socket.emit('users:newAccountActivated');
        $auth.setToken(response);
        $rootScope.currentUser = response.data.user;
        $window.localStorage.user = JSON.stringify(response.data.user);
        $location.path('/');
      }).catch(function (err) {
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
'use strict';

angular.module('app.auth').controller('ForgotCtrl', ["$scope", "Account", function ($scope, Account) {
  $scope.forgotPassword = function () {
    Account.forgotPassword($scope.user).then(function (response) {
      $scope.messages = {
        success: [response.data]
      };
    }).catch(function (response) {
      $scope.messages = {
        error: Array.isArray(response.data) ? response.data : [response.data]
      };
    });
  };
}]);
'use strict';

angular.module('app.auth').controller('LoginCtrl', ["$scope", "$rootScope", "$location", "$window", "$auth", function ($scope, $rootScope, $location, $window, $auth) {
  $scope.login = function () {
    $auth.login($scope.user).then(function (response) {
      $rootScope.currentUser = response.data.user;
      $window.localStorage.user = JSON.stringify(response.data.user);
      $location.path('/account');
    }).catch(function (response) {
      $scope.messages = {
        error: Array.isArray(response.data) ? response.data : [response.data]
      };
    });
  };

  $scope.authenticate = function (provider) {
    $auth.authenticate(provider).then(function (response) {
      $rootScope.currentUser = response.data.user;
      $window.localStorage.user = JSON.stringify(response.data.user);
      $location.path('/');
    }).catch(function (response) {
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
'use strict';

(function () {
  'use strict';

  angular.module('app.auth').controller('ResetController', ResetController);

  ResetController.$inject = ['$rootScope', '$location', '$window', '$auth', 'Account'];
  function ResetController($rootScope, $location, $window, $auth, Account) {
    var vm = this;

    vm.resetPassword = resetPassword;

    activate();

    ////////////////

    function activate() {}

    function resetPassword() {
      var token = $location.search().token;
      Account.resetPassword(token, vm.user).then(function (response) {
        $auth.setToken(response);
        $rootScope.currentUser = response.data.user;
        $window.localStorage.user = JSON.stringify(response.data.user);
        $location.path('/');
      }).catch(function (err) {
        vm.messages = {
          error: Array.isArray(err.data) ? err.data : [err.data]
        };
      });
    }
  }
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.auth').controller('SignupController', SignupController);

  SignupController.$inject = ['$rootScope', '$location', '$window', '$auth'];
  function SignupController($rootScope, $location, $window, $auth) {
    var vm = this;

    vm.signup = signup;

    activate();

    ////////////////

    function activate() {}

    function signup() {
      $auth.signup(vm.user).then(function (response) {
        vm.user = null;
        vm.messages = {
          success: Array.isArray(response.data) ? response.data : [response.data]
        };
      }).catch(function (response) {
        vm.messages = {
          error: Array.isArray(response.data) ? response.data : [response.data]
        };
      });
    }
  }
})();
'use strict';

angular.module('app.layout').controller('HeaderCtrl', ["$scope", "$location", "$window", "$auth", function ($scope, $location, $window, $auth) {
  $scope.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };

  $scope.isAuthenticated = function () {
    return $auth.isAuthenticated();
  };

  $scope.logout = function () {
    $auth.logout();
    delete $window.localStorage.user;
    $location.path('/');
  };
}]);
'use strict';

(function () {
    'use strict';

    angular.module('app.layout').controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', '$auth'];
    function HomeController($scope, $auth) {
        var vm = this;

        vm.isAuthenticated = isAuthenticated;

        activate();

        ////////////////

        function activate() {}

        function isAuthenticated() {
            return $auth.isAuthenticated();
        }
    }
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.point-board').controller('PointController', PointController);

  PointController.$inject = ['$scope', '$timeout', '$q', 'Point', 'Account', 'Socket'];
  function PointController($scope, $timeout, $q, Point, Account, Socket) {
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
      vm.currentUser = $scope.currentUser;
      getUsersPoints();
      getRecent();
      getUsers();
      notifyLoggedIn(vm.currentUser);
    }

    function getUsersPoints() {
      Point.getUsersPoints().then(function (userPoints) {
        vm.userPoints = userPoints.data.userPoints;
        setPoints();
      }).catch(function (response) {
        setMsg(response.data, true);
      });
    }

    function getUsers() {
      Account.getUsers().then(function (users) {
        vm.users = users.data;
        getLoggedInUsers();
      }).catch(function (response) {
        setMsg(response.data, true);
      });
    }

    function selectUser(user) {
      vm.user = user;
    }

    function setPointType(pointType) {
      vm.pointType = pointType;
    }

    function pingServer() {
      while (true) {}
    }

    /**
     * ADD user point
     */
    function createUserPoint(toUser, pointType) {
      if (!toUser) {
        setMsg({ msg: 'You must select a user' }, true);
      } else {
        var data = {
          pointType: pointType,
          toUser: toUser
        };
        Point.createPoint(data).then(function (userPoints) {
          enrichRecent([userPoints.data.userVote]);
          vm.recent.push(userPoints.data.userVote);
          // emit point addition
          notifyPoint(userPoints.data.userVote);
          // Update userpoint list
          getUsersPoints();
          setMsg(userPoints.data, false);
          vm.user = null;
        }).catch(function (response) {
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
      Point.removePoint(toUser, pointType).then(function (userPoints) {
        enrichRecent([userPoints.data.userVote]);
        vm.recent.push(userPoints.data.userVote);
        // emit point change
        notifyPoint(userPoints.data.userVote);
        // update dong/rockstar
        getUsersPoints();
        setMsg(userPoints.data, false);
      }).catch(function (response) {
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
      Point.getUserVotes().then(function (recent) {
        enrichRecent(recent.data.userVotes);
        vm.recent = recent.data.userVotes;
      }).catch(function (err) {});
    }

    function enrichRecent(userVotes) {
      userVotes.map(function (currVal) {
        currVal.successClass = false;
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
      userPoints.forEach(function (up) {
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
      userPoints.forEach(function (up) {
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
      if (!Array.isArray(msg)) {
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
      vm.toPromise = setToEmpty(vm.messages, ['success', 'error'], 3000);
    }

    ///////////////////// SOCKET FUNCTIONS

    function notifyPoint(userVote) {
      Socket.emit('point:change', userVote);
    }

    function notifyLoggedIn(loggedInUser) {
      Socket.emit('user:newUserLoggedIn', loggedInUser);
    }

    function setToFalse(obj, prop, delay) {
      return $timeout(function () {
        obj[prop] = false;
      }, delay, true);
    }

    function setToEmpty(obj, props, delay) {
      return $timeout(function () {
        if (!Array.isArray(props)) {
          props = [props];
        }
        props.map(function (prop) {
          delete obj[prop];
        });
      }, delay, true);
    }

    /**
     * Someone added/removed a point
     * Update view with new data
     */
    Socket.on('point:change', function (userVote) {
      userVote.userVote.successClass = true;
      setToFalse(userVote.userVote, 'successClass', 5000);
      vm.recent.push(userVote.userVote);
      // update board with point change
      getUsersPoints();
    });

    /**
     * Server asked for information about the logged in user
     * Send back current logged in user info
     */
    Socket.on('user:userDetailReq', function (data, cb) {
      cb(vm.currentUser);
      Socket.emit('user:userDetailRes', vm.currentUser);
    });

    // A new user logged in, update logged in user list
    Socket.on('user:loggedin', function (users) {
      setLoggedInUsers(users.loggedInUsers);
    });

    // Update user list if a new user registers
    Socket.on('users:newAccount', function (obj) {
      getUsers();
    });

    /**
     * Get all logged in users
     */
    function getLoggedInUsers() {
      Socket.emit('user:getLoggedInUsers', {}, function (users) {
        setLoggedInUsers(users.loggedInUsers);
      });
    }

    /**
     * Set which users are logged in
     */
    function setLoggedInUsers(users) {
      vm.users.forEach(function (user) {
        // See if userid is in logged in user map
        if (users[user._id]) {
          // yes, mark user as logged in
          user.loggedIn = true;
        } else {
          // no, mark user as not logged in
          user.loggedIn = false;
        }
      });
    }
  }
})();
'use strict';

angular.module('app.services').factory('Account', ["$http", function ($http) {
  return {
    updateProfile: function updateProfile(data) {
      return $http.put('/account', data);
    },
    changePassword: function changePassword(data) {
      return $http.put('/account', data);
    },
    deleteAccount: function deleteAccount() {
      return $http.delete('/account');
    },
    forgotPassword: function forgotPassword(data) {
      return $http.post('/forgot', data);
    },
    resetPassword: function resetPassword(token, data) {
      return $http.post('/reset/' + token, data);
    },
    activateAccount: function activateAccount(token, data) {
      return $http.post('/activate/' + token, data);
    },
    getUsers: function getUsers(data) {
      return $http.get('/users', data);
    }
  };
}]);
'use strict';

angular.module('app.services').factory('Point', ["$http", function ($http) {
  return {
    getUsersPoints: function getUsersPoints(query) {
      var options = {};
      options.query = query;
      return $http.get('/userPoints', options);
    },
    getUserPoints: function getUserPoints(id, query) {
      var options = {};
      options.query = query;
      return $http.get('/userPoints/' + id, options);
    },
    getUserVotes: function getUserVotes(id, query) {
      var options = {};
      options.query = query;
      return $http.get('/userVotes', options);
    },
    createPoint: function createPoint(data) {
      return $http.post('/point', data);
    },
    removePoint: function removePoint(toUser, pointType, query) {
      var options = {};
      options.query = query || {};
      return $http.delete('/point/' + toUser + '/' + pointType, options);
    }
  };
}]);
'use strict';

(function () {
  'use strict';

  angular.module('app.services').factory('Socket', Socket);

  Socket.$inject = ['$rootScope'];
  function Socket($rootScope) {

    var socket = io.connect();

    var service = {
      on: on,
      emit: emit,
      disconnect: disconnect
    };

    return service;

    ////////////////
    function on(eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    }

    function emit(eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }

    function disconnect(eventName, data, callback) {
      socket.disconnect();
    }
  }
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.user').controller('ProfileController', ProfileController);

  ProfileController.$inject = ['$rootScope', '$location', '$window', '$auth', 'Account'];
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
      Account.updateProfile(vm.profile).then(function (response) {
        $rootScope.currentUser = response.data.user;
        $window.localStorage.user = JSON.stringify(response.data.user);
        vm.messages = {
          success: [response.data]
        };
      }).catch(function (response) {
        vm.messages = {
          error: Array.isArray(response.data) ? response.data : [response.data]
        };
      });
    }

    function changePassword(password, confirm) {
      vm.profile.password = password || null;
      vm.profile.confirm = confirm || null;
      Account.changePassword(vm.profile).then(function (response) {
        console.log('response', response);
        vm.messages = {
          success: [response.data]
        };
        delete vm.password;
        delete vm.confirm;
      }).catch(function (response) {
        console.log('response', response);
        vm.messages = {
          error: Array.isArray(response.data) ? response.data : [response.data]
        };
      });
    }

    function deleteAccount() {
      Account.deleteAccount().then(function () {
        $auth.logout();
        delete $window.localStorage.user;
        $location.path('/');
      }).catch(function (response) {
        vm.messages = {
          error: [response.data]
        };
      });
    }
  }
})();