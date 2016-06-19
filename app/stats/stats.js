(function() {
'use strict';

  angular
    .module('app.stats')
    .controller('StatsController', StatsController);

  StatsController.$inject = ['$sce','Stats', 'Toast'];
  function StatsController($sce, Stats, Toast) {
    var vm = this;

    // 7: {
    //   numDays: 7,
    //   dongs: [],
    //   rockstars: []
    // }
    vm.mostPoints = {};

    vm.rockstarTemplate = '/stats/stats.popup.html';

    vm.getMessagesHtml = getMessagesHtml;

    activate();

    ////////////////

    function activate() {
      getStats(1, true);
      getStats(3);
      getStats(5);
      getStats(7);
      getStats(14);
      getStats(30);
    }

    function getStats(numDays, isOpen) {
      isOpen = isOpen || false;
      // build query strings as needed
      Stats.getStats({numDays: numDays})
      .then(function(stats) {
        vm.mostPoints[numDays] = stats.data;
        vm.mostPoints[numDays].isOpen = isOpen;
        addMessages(vm.mostPoints[numDays].dongs, 'dongs');
        addMessages(vm.mostPoints[numDays].rockstars, 'rockstars');
      })
      .catch(function(response){
        Toast.show('error', 'Error', response.data);
      });
    }

    function addMessages(points, type) {
      points.forEach(function(point) {
        point.messages = getMessagesHtml(point[type]);
      });
    }

    function getMessagesHtml(pointArray) {
      var hasMsg = false;
      var html = '<ul style=" padding-left:5px;">';
      pointArray.forEach(function(element) {
        if (element.message) {
          hasMsg = true;
          html += '<li>'+element.message+'</li>';
        }
      });
      html += '</ul>';
      if (hasMsg) {
        return $sce.trustAsHtml(html);
      } else {
        return false;
      }

    }
  }
})();