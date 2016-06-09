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