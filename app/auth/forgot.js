angular.module('app.auth')
  .controller('ForgotCtrl', function($scope, Account, Toast) {
    $scope.forgotPassword = function() {
      Account.forgotPassword($scope.user)
        .then(function(response) {
          Toast.show('success', 'Success', response.data);
        })
        .catch(function(response) {
          Toast.show('error', 'Error', response.data);
        });
    };
  });