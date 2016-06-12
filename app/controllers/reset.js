(function() {
'use strict';

  angular
    .module('MyApp')
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
