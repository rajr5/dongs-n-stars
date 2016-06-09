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
      createPoint: function(data) {
        return $http.post('/point', data);
      }
    };
  });
