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