angular.module('app.services')
  .factory('Account', function($http) {
    return {
      updateProfile: function(data) {
        return $http.put('/account', data);
      },
      changePassword: function(data) {
        return $http.put('/account', data);
      },
      deleteAccount: function() {
        return $http.delete('/account');
      },
      forgotPassword: function(data) {
        return $http.post('/forgot', data);
      },
      resetPassword: function(token, data) {
        return $http.post('/reset/'+token, data);
      },
      activateAccount: function(token, data) {
        return $http.post('/activate/'+token, data);
      },
      getUsers: function(data) {
        return $http.get('/users', data);
      }
    };
  });