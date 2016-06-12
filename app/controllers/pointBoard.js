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