angular.module('app.services')
  .factory('Point', function($http) {
    return {
      getUsersPoints: function(query) {
        var options = {};
        options.query = query;
        return $http.get('/api/userPoints', options);
      },
      getUserPoints: function(id, query) {
        var options = {};
        options.query = query;
        return $http.get('/api/userPoints/'+id, options);
      },
      getUserVotes: function(id, query) {
        var options = {};
        options.query = query;
        return $http.get('/api/userVotes', options);
      },
      createPoint: function(data) {
        return $http.post('/api/point', data);
      },
      removePoint: function(toUser, pointType, query) {
        var options = {};
        options.query = query || {};
        return $http.delete('/api/point/'+toUser+'/'+pointType, options);
      }
    };
  });
