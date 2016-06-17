(function() {
'use strict';

  angular
    .module('app.services')
    .factory('Stats', Stats);

  Stats.$inject = ['$http'];
  function Stats($http) {
    var service = {
      getStats:getStats
    };

    return service;

    ////////////////
    function getStats(query) {
      var options = {};
      options.params = query;
      return $http.get('/api/stats', options);
    }
  }
})();

