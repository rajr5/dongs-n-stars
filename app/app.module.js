(function() {
  'use strict';

  angular.module('app', [
    /** Application Modules */
    'app.config','app.auth', 'app.layout', 'app.services',
    'app.user', 'app.point-board', 'app.templates',
    'app.stats',
    /** Angular Modules */
    'ngAnimate', 'ngTouch',

    /** 3rd Party Modules */
    'ui.bootstrap', 'toaster'
  ]);
})();