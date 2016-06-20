'use strict';

(function () {
  'use strict';

  angular.module('app', [
  /** Application Modules */
  'app.config', 'app.auth', 'app.layout', 'app.services', 'app.user', 'app.point-board', 'app.templates', 'app.stats',
  /** Angular Modules */
  'ngAnimate', 'ngTouch',

  /** 3rd Party Modules */
  'ui.bootstrap', 'toaster']);
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.auth', []);
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.config', ['ngRoute', 'satellizer']);
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

  angular.module('app.stats', []);
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.user', []);
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.auth').controller('ActivateController', ActivateController);

  ActivateController.$inject = ['$rootScope', '$location', '$window', '$auth', 'Account', 'Socket', 'Toast'];
  function ActivateController($rootScope, $location, $window, $auth, Account, Socket, Toast) {
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
        $location.path('/pointBoard');
      }).catch(function (response) {
        Toast.show('error', 'Error', response.error || response.data);
      });
    }
  }
})();
'use strict';

angular.module('app.auth').controller('ForgotCtrl', ["$scope", "Account", "Toast", function ($scope, Account, Toast) {
  $scope.forgotPassword = function () {
    Account.forgotPassword($scope.user).then(function (response) {
      Toast.show('success', 'Success', response.data);
    }).catch(function (response) {
      Toast.show('error', 'Error', response.data);
    });
  };
}]);
'use strict';

angular.module('app.auth').controller('LoginCtrl', ["$scope", "$rootScope", "$location", "$window", "$auth", "Toast", function ($scope, $rootScope, $location, $window, $auth, Toast) {
  $scope.login = function () {
    $auth.login($scope.user).then(function (response) {
      $rootScope.currentUser = response.data.user;
      $window.localStorage.user = JSON.stringify(response.data.user);
      $location.path('/pointBoard');
    }).catch(function (response) {
      Toast.show('error', 'Error', response.data);
    });
  };

  $scope.authenticate = function (provider) {
    $auth.authenticate(provider).then(function (response) {
      $rootScope.currentUser = response.data.user;
      $window.localStorage.user = JSON.stringify(response.data.user);
      $location.path('/pointBoard');
    }).catch(function (response) {
      Toast.show('error', 'Error', response.error || response.data);
    });
  };
}]);
'use strict';

(function () {
  'use strict';

  angular.module('app.auth').controller('ResetController', ResetController);

  ResetController.$inject = ['$rootScope', '$location', '$window', '$auth', 'Account', 'Toast'];
  function ResetController($rootScope, $location, $window, $auth, Account, Toast) {
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
      }).catch(function (response) {
        Toast.show('error', 'Error', response.data);
      });
    }
  }
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.auth').controller('SignupController', SignupController);

  SignupController.$inject = ['$rootScope', '$location', '$window', '$auth', 'Toast'];
  function SignupController($rootScope, $location, $window, $auth, Toast) {
    var vm = this;

    vm.buttonDisable = false;
    vm.signup = signup;

    activate();

    ////////////////

    function activate() {}

    function signup() {
      vm.buttonDisable = true;
      $auth.signup(vm.user).then(function (response) {
        vm.user = null;
        $location.path('/login');
        Toast.show('success', 'Success', response.data);
      }).catch(function (response) {
        Toast.show('error', 'Error', response.data);
        vm.buttonDisable = false;
      });
    }
  }
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
    }).when('/stats', {
      templateUrl: 'stats/stats.html',
      controller: 'StatsController',
      controllerAs: 'vm',
      resolve: { loginRequired: loginRequired }
    }).otherwise({
      templateUrl: 'layout/404.html'
    });

    $authProvider.loginUrl = '/api/login';
    $authProvider.signupUrl = '/api/signup';

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

  PointController.$inject = ['$scope', '$timeout', '$q', 'Point', 'Account', 'Socket', 'Toast'];
  function PointController($scope, $timeout, $q, Point, Account, Socket, Toast) {
    var vm = this;

    vm.userPoints = null;
    vm.dongs = [];
    vm.rockstars = [];
    vm.recent = [];
    vm.recentMessage = null;
    vm.pointType = 'dong';
    vm.message = null;
    vm.show = {
      recentActivity: true,
      givePoint: true,
      rockstar: true,
      dong: true
    };

    vm.popover = {
      addDong: 'point-board/popover-templates/add-dong.html',
      addRockstar: 'point-board/popover-templates/add-rockstar.html',
      removeDong: 'point-board/popover-templates/remove-dong.html',
      removeRockstar: 'point-board/popover-templates/remove-rockstar.html'
    };

    vm.showRecentActivity = true;

    vm.setPointType = setPointType;
    vm.getUsersPoints = getUsersPoints;
    vm.createUserPoint = createUserPoint;
    vm.messageVote = messageVote;
    vm.removeUserPoint = removeUserPoint;
    vm.selectUser = selectUser;
    vm.toggleShow = toggleShow;
    vm.isVisible = isVisible;

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
        Toast.show('error', 'Error', response.data);
        // setMsg(response.data, true);
      });
    }

    function getUsers() {
      Account.getUsers().then(function (users) {
        vm.users = users.data;
        getLoggedInUsers();
      }).catch(function (response) {
        // Toast.show('error', 'Error', response.data);
        // setMsg(response.data, true);
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

    function toggleShow(key) {
      vm.show[key] = !vm.show[key];
    }

    function isVisible(key) {
      return vm.show[key];
    }

    /**
     * ADD user point
     */
    function createUserPoint(toUser, pointType, message) {
      if (!toUser) {
        // setMsg({msg: 'You must select a user'}, true);
        Toast.show('error', 'Error', { msg: 'You must select a user' });
      } else {
        var data = {
          pointType: pointType,
          toUser: toUser,
          message: message
        };

        Point.createPoint(data).then(function (userPoints) {
          enrichRecent([userPoints.data.userVote]);
          vm.recent.push(userPoints.data.userVote);
          // emit point addition
          notifyPoint(userPoints.data.userVote);
          // Update userpoint list
          getUsersPoints();
          Toast.show('success', 'Success', userPoints.data);
          // setMsg(userPoints.data, false);
          vm.user = null;
          vm.message = null;
          vm.pointMessage = null;
        }).catch(function (response) {
          Toast.show('error', 'Error', response.data);
          // setMsg(response.data, true);
          vm.user = null;
        });
      }
    }

    function messageVote(userVote, voteType) {
      Point.messageVote(userVote._id, voteType).then(function (response) {
        // set user vote object with change
        setUserVote(response.data, userVote, voteType);
        // emit change
        notifyMessageVote(userVote, voteType);
      }).catch(function (response) {
        // setMsg(response.data, true);
        Toast.show('error', 'Error', response.data);
      });
    }

    /**
     * Helper function to set user vote and 
     * have the change event fire
     */
    function setUserVote(src, target, voteType) {
      target.downvote = src.downvote;
      target.upvote = src.upvote;
      target[voteType + 'Changed'] = true;
      setToFalse(target, voteType + 'Changed', 2000);
    }

    /**
     * REMOVE user point
     */
    function removeUserPoint(toUser, pointType, message) {
      // var data = {
      //   pointType: pointType,
      //   toUser: toUser,
      //   message: message
      // };
      Point.removePoint(toUser, pointType, { message: message }).then(function (userPoints) {
        enrichRecent([userPoints.data.userVote]);
        vm.recent.push(userPoints.data.userVote);
        // emit point change
        notifyPoint(userPoints.data.userVote);
        // update dong/rockstar
        getUsersPoints();
        // setMsg(userPoints.data, false);
        Toast.show('success', 'Success', userPoints.data);
        vm.message = null;
        vm.pointMessage = null;
      }).catch(function (response) {
        // setMsg(response.data, true);
        Toast.show('error', 'Error', response.data);
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

    function notifyMessageVote(userVote, voteType) {
      Socket.emit('point:messageVote', { userVote: userVote, coteType: voteType });
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
      Toast.show('note', 'Point Given', 'Another user added/removed a point');
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

    /**
     * Someone upvoted or downvoted
     */
    Socket.on('point:newMessageVote', function (messageVote) {
      // loop through all recent and find userVote
      vm.recent.forEach(function (currVote) {
        if (currVote._id === messageVote.userVote._id) {
          // Set the userVote item to match the up/downvotes
          setUserVote(messageVote.userVote, currVote, messageVote.voteType);
          Toast.show('note', 'New Message Vote', 'Another user voted on a message');
          return;
        }
      }, this);
    });

    // A new user logged in, update logged in user list
    Socket.on('user:loggedin', function (users) {
      setLoggedInUsers(users.loggedInUsers);
    });

    // Update user list if a new user registers
    Socket.on('users:newAccount', function (obj) {
      Toast.show('note', 'New User', 'New user registered, list updated');
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
      return $http.put('/api/account', data);
    },
    changePassword: function changePassword(data) {
      return $http.put('/api/account', data);
    },
    deleteAccount: function deleteAccount() {
      return $http.delete('/api/account');
    },
    forgotPassword: function forgotPassword(data) {
      return $http.post('/api/forgot', data);
    },
    resetPassword: function resetPassword(token, data) {
      return $http.post('/api/reset/' + token, data);
    },
    activateAccount: function activateAccount(token, data) {
      return $http.post('/api/activate/' + token, data);
    },
    getUsers: function getUsers(data) {
      return $http.get('/api/users', data);
    }
  };
}]);
'use strict';

angular.module('app.services').factory('Point', ["$http", function ($http) {
  return {
    getUsersPoints: function getUsersPoints(query) {
      var options = {};
      options.params = query;
      return $http.get('/api/userPoints', options);
    },
    getUserPoints: function getUserPoints(id, query) {
      var options = {};
      options.params = query;
      return $http.get('/api/userPoints/' + id, options);
    },
    getUserVotes: function getUserVotes(id, query) {
      var options = {};
      options.params = query;
      return $http.get('/api/userVotes', options);
    },
    createPoint: function createPoint(data) {
      return $http.post('/api/point', data);
    },
    messageVote: function messageVote(userVoteId, voteType) {
      return $http.put('/api/userVotes/' + userVoteId + '/' + voteType);
    },
    removePoint: function removePoint(toUser, pointType, query) {
      var options = {};
      options.params = query || {};
      return $http.delete('/api/point/' + toUser + '/' + pointType, options);
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

  angular.module('app.services').factory('Stats', Stats);

  Stats.$inject = ['$http'];
  function Stats($http) {
    var service = {
      getStats: getStats
    };

    return service;

    ////////////////
    function getStats(query) {
      var options = {};
      options.params = query;
      return $http.get('/api/stats', options);
    }
  }
})();
'use strict';

(function () {
    'use strict';

    angular.module('app.services').factory('Toast', ToasterService);

    ToasterService.$inject = ['toaster'];
    function ToasterService(toaster) {
        var service = {
            show: show
        };

        return service;

        ////////////////
        function show(type, title, messages) {
            /**
             * Format for error messages, only msg param is used.
             * Can also just pass in object with msg field without being wrapped in array
             * @param body = [{ param: 'urlparam', msg: 'Invalid urlparam', value: 't1est' } ]]
             */
            type = type || 'success';
            // Ensure valid type
            if (!['success', 'warning', 'error', 'wait', 'note'].includes(type)) {
                type = 'success';
            }
            if (!Array.isArray(messages)) {
                messages = [messages];
            }
            var text = '';
            messages.map(function (msg) {
                text += '<ul style="list-style: none; padding-left:0;">';
                if (msg.msg) {
                    text += '<li>' + msg.msg + '</li>';
                } else if (typeof msg === 'string') {
                    text += '<li>' + msg + '</li>';
                }
                text += '</ul>';
            });
            toaster.pop(type, title, text, null, 'trustedHtml');
        }
    }
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.stats').controller('StatsController', StatsController);

  StatsController.$inject = ['$sce', 'Stats', 'Toast'];
  function StatsController($sce, Stats, Toast) {
    var vm = this;

    // 7: {
    //   numDays: 7,
    //   dongs: [],
    //   rockstars: []
    // }
    vm.mostPoints = {};

    vm.rockstarTemplate = '/stats/stats.popup.html';

    vm.getMessagesHtml = getMessagesHtml;

    activate();

    ////////////////

    function activate() {
      getStats(1, true);
      getStats(3);
      getStats(5);
      getStats(7);
      getStats(14);
      getStats(30);
    }

    function getStats(numDays, isOpen) {
      isOpen = isOpen || false;
      // build query strings as needed
      Stats.getStats({ numDays: numDays }).then(function (stats) {
        vm.mostPoints[numDays] = stats.data;
        vm.mostPoints[numDays].isOpen = isOpen;
        addMessages(vm.mostPoints[numDays].dongs, 'dongs');
        addMessages(vm.mostPoints[numDays].rockstars, 'rockstars');
      }).catch(function (response) {
        Toast.show('error', 'Error', response.data);
      });
    }

    function addMessages(points, type) {
      points.forEach(function (point) {
        point.messages = getMessagesHtml(point[type]);
      });
    }

    function getMessagesHtml(pointArray) {
      var hasMsg = false;
      var html = '<ul style=" padding-left:5px;">';
      pointArray.forEach(function (element) {
        if (element.message) {
          hasMsg = true;
          html += '<li>' + element.message + '</li>';
        }
      });
      html += '</ul>';
      if (hasMsg) {
        return $sce.trustAsHtml(html);
      } else {
        return false;
      }
    }
  }
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.user').controller('ProfileController', ProfileController);

  ProfileController.$inject = ['$rootScope', '$location', '$window', '$auth', 'Account', 'Toast', 'Modal'];
  function ProfileController($rootScope, $location, $window, $auth, Account, Toast, Modal) {
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
        Toast.show('success', 'Success', response.data);
      }).catch(function (response) {
        Toast.show('error', 'Error', response.data);
      });
    }

    function changePassword(password, confirm) {
      vm.profile.password = password || null;
      vm.profile.confirm = confirm || null;
      Account.changePassword(vm.profile).then(function (response) {
        Toast.show('success', 'Success', response.data);

        delete vm.password;
        delete vm.confirm;
      }).catch(function (response) {
        Toast.show('error', 'Error', response.data);
      });
    }

    function deleteAccount() {
      Modal.open('Are you sure?', 'Would you really like to delete your account?', { confirm: 'Yes, delete my account', cancel: 'No, keep my account' }).result.then(function (data) {
        // User confirmed, delete account
        Account.deleteAccount().then(function () {
          $auth.logout();
          delete $window.localStorage.user;
          $location.path('/');
          Toast.show('warning', 'Success', 'Account was successfully deleted');
        }).catch(function (response) {
          Toast.show('error', 'Error', response.data);
        });
      }, function (data) {
        console.log('data', data);
      });
    }
  }
})();
'use strict';

(function () {
        'use strict';

        angular.module('app.services').controller('ModalController', ModalController);

        ModalController.$inject = ['$uibModalInstance', 'title', 'content', 'buttons'];
        function ModalController($uibModalInstance, title, content, buttons) {
                var vm = this;
                vm.title = title;
                vm.content = content;
                vm.ok = ok;
                vm.cancel = cancel;
                vm.buttons = buttons;

                activate();

                ////////////////

                function activate() {}

                function ok() {
                        $uibModalInstance.close('ok');
                }

                function cancel() {
                        $uibModalInstance.dismiss('cancel');
                }
        }
})();
'use strict';

(function () {
  'use strict';

  angular.module('app.services').factory('Modal', Modal);

  Modal.$inject = ['$uibModal'];
  function Modal($uibModal) {
    var service = {
      open: open
    };

    return service;

    /**
     * @param title {String} Title of modal
     * @param content {string|mixed} Content for modal
     * @param buttons {object} Object to override 'ok' and 'cancel'  e.x. {confirm: 'Yes', cancel: 'No'}
     * @param templateUrl {String} Path to alternative template to use.  Content should match datatype expected by template
     */
    function open(_title, _content, _buttons, templateUrl) {
      return $uibModal.open({
        templateUrl: templateUrl || 'services/modal/modal.html',
        controller: 'ModalController',
        controllerAs: 'vm',
        resolve: {
          title: function title() {
            return _title || 'Confirm';
          },
          content: function content() {
            return _content || '';
          },
          buttons: function buttons() {
            return _buttons || { confirm: 'ok', cancel: 'cancel' };
          }
        }
      });
    }
  }
})();