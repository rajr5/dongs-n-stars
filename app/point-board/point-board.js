(function() {
'use strict';

  angular
    .module('app.point-board')
    .controller('PointController', PointController);

  PointController.$inject = ['$scope','$timeout', '$q', 'Point', 'Account', 'Socket'];
  function PointController($scope, $timeout, $q, Point, Account, Socket) {
    var vm = this;

    vm.userPoints = null;
    vm.dongs = [];
    vm.rockstars = [];
    vm.recent = [];
    vm.pointType = 'dong';
    vm.message = null;
    vm.show = {
      recentActivity: true,
      givePoint: true,
      rockstar: true,
      dong: true
    };
    vm.showRecentActivity = true;

    vm.setPointType = setPointType;
    vm.getUsersPoints = getUsersPoints;
    vm.createUserPoint = createUserPoint;
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
      Point.getUsersPoints()
      .then(function(userPoints) {
        vm.userPoints = userPoints.data.userPoints;
        setPoints();
      })
      .catch(function(response){
        setMsg(response.data, true);
      });
    }

    function getUsers() {
      Account.getUsers()
      .then(function(users) {
        vm.users = users.data;
        getLoggedInUsers();
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

    function pingServer() {
      while(true) {

      }
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
        setMsg({msg: 'You must select a user'}, true);
      } else {
        var data = {
          pointType: pointType,
          toUser: toUser,
          message: message
        };
        Point.createPoint(data)
        .then(function(userPoints) {
          enrichRecent([userPoints.data.userVote]);
          vm.recent.push(userPoints.data.userVote);
          // emit point addition
          notifyPoint(userPoints.data.userVote);
          // Update userpoint list
          getUsersPoints();
          setMsg(userPoints.data, false);
          vm.user = null;
          vm.message = null;
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
        // emit point change
        notifyPoint(userPoints.data.userVote);
        // update dong/rockstar
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
      return $timeout(()=>{
        obj[prop] = false;
      }, delay, true);
    }


    function setToEmpty(obj, props, delay) {
      return $timeout(()=>{
        if (!Array.isArray(props)) {
          props = [props];
        }
        props.map(function(prop) {
          delete obj[prop];
        });
      }, delay, true);
    }

    /**
     * Someone added/removed a point
     * Update view with new data
     */
    Socket.on('point:change', function(userVote) {
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
    Socket.on('user:userDetailReq', function(data, cb) {
      cb(vm.currentUser);
      Socket.emit('user:userDetailRes', vm.currentUser);
    });

    // A new user logged in, update logged in user list
    Socket.on('user:loggedin', function(users) {
        setLoggedInUsers(users.loggedInUsers);
    });

    // Update user list if a new user registers
    Socket.on('users:newAccount', (obj) => {
      getUsers();
    });

    /**
     * Get all logged in users
     */
    function getLoggedInUsers() {
      Socket.emit('user:getLoggedInUsers',{}, function(users) {
        setLoggedInUsers(users.loggedInUsers);
      });
    }

    /**
     * Set which users are logged in
     */
    function setLoggedInUsers(users) {
        vm.users.forEach(function(user) {
          // See if userid is in logged in user map
          if(users[user._id]) {
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