(function() {
'use strict';

  angular
    .module('app.auth')
    .controller('ActivateController', ActivateController);

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
      Account.activateAccount(token)
      .then((response) => {
        Socket.emit('users:newAccountActivated');
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