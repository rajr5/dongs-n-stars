(function() {
  'use strict';

    angular
      .module('app.user')
      .controller('ProfileController', ProfileController);

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
      Account.updateProfile(vm.profile)
        .then(function(response) {
          $rootScope.currentUser = response.data.user;
          $window.localStorage.user = JSON.stringify(response.data.user);
          Toast.show('success', 'Success', response.data);
        })
        .catch(function(response) {
          Toast.show('error', 'Error', response.data);
        });
    }

    function changePassword(password, confirm) {
      vm.profile.password = password || null;
      vm.profile.confirm = confirm || null;
      Account.changePassword(vm.profile)
        .then(function(response) {
          Toast.show('success', 'Success', response.data);

          delete vm.password;
          delete vm.confirm;
        })
        .catch(function(response) {
          Toast.show('error', 'Error', response.data);
        });
    }

    function deleteAccount() {
      Modal.open('Are you sure?', 'Would you really like to delete your account?', {confirm: 'Yes, delete my account', cancel: 'No, keep my account'})
      .result.then(function(data){
        // User confirmed, delete account
        Account.deleteAccount()
          .then(function() {
            $auth.logout();
            delete $window.localStorage.user;
            $location.path('/');
            Toast.show('warning', 'Success', 'Account was successfully deleted');
          })
          .catch(function(response) {
            Toast.show('error', 'Error', response.data);
          });
      }, function(data) {
        console.log('data', data);
      });

    }

    }
  })();