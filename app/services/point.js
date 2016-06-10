angular.module('MyApp')
  .factory('Point', function($http) {
    return {
      getUsersPoints: function(query) {
        var options = {};
        options.query = query;
        return $http.get('/userPoints', options);
      },
      getUserPoints: function(id, query) {
        var options = {};
        options.query = query;
        return $http.get('/userPoints/'+id, options);
      },
      getUserVotes: function(id, query) {
        var options = {};
        options.query = query;
        return $http.get('/userVotes', options);
      },
      createPoint: function(data) {
        return $http.post('/point', data);
      },
      removePoint: function(toUser, pointType, query) {
        var options = {};
        options.query = query || {};
        return $http.delete('/point/'+toUser+'/'+pointType, options);
      }
    };
  });
