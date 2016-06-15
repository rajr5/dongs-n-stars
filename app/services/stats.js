(function() {
'use strict';

  angular
    .module('app.services')
    .factory('Stats', Stats);

  Stats.$inject = ['$http'];
  function Stats($http) {
    var service = {
      getStats:getStat
    };

    return service;

    ////////////////
    function getStat(data) {
      var options = {};
      options.query = query;
      return $http.get('/stats');
    }
  }
})();

