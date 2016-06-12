(function() {
'use strict';

  angular
    .module('MyApp')
    .controller('ActivateController', ActivateController);

  ActivateController.$inject = ['$rootScope', '$location', '$window', '$auth'];
  function ActivateController($rootScope, $location, $window, $auth) {
    var vm = this;
    

    activate();

    ////////////////

    function activate() { }
  }
})();