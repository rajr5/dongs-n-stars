(function() {
'use strict';

  angular
    .module('app.stats')
    .controller('StatsController', StatsController);

  StatsController.$inject = ['Stats'];
  function StatsController(Stats) {
    var vm = this;


    activate();

    ////////////////

    function activate() {
      getStats();
    }

    function getStats() {
      // build query strings as needed
      Stats.getStats()
      .then(function(stats) {

      })
      .catch(function(err){

      });
    }
  }
})();