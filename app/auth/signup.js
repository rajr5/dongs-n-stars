(function() {
'use strict';

  angular
    .module('app.auth')
    .controller('SignupController', SignupController);

  SignupController.$inject = ['$rootScope', '$location', '$window', '$auth'];
  function SignupController($rootScope, $location, $window, $auth) {
    var vm = this;

    vm.signup = signup;

    activate();

    ////////////////

    function activate() {

      }


    function signup() {
      $auth.signup(vm.user)
      .then(function(response) {
        vm.user = null;
        vm.messages = {
          success: Array.isArray(response.data) ? response.data : [response.data]
        };
      })
      .catch(function(response) {
      vm.messages = {
        error: Array.isArray(response.data) ? response.data : [response.data]
      };
      });
    }
  }
})();