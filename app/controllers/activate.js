(function() {
'use strict';

  angular
    .module('MyApp')
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