(function() {
'use strict';

  angular
    .module('app.services')
    .factory('Socket', Socket);

  Socket.$inject = ['$rootScope'];
  function Socket($rootScope) {

    var socket = io.connect();

    var service = {
      on: on,
      emit: emit,
      disconnect: disconnect
    };

    return service;

    ////////////////
    function on(eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    }

    function emit(eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }

    function disconnect(eventName, data, callback) {
      socket.disconnect();
    }
  }
})();