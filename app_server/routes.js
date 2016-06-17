(function(){
  'use strict';

  var express = require('express');
  var router = express.Router();

  // Controllers
  var UserController = require('./controllers/user');
  var PointController = require('./controllers/point');
  var StatController = require('./controllers/stats');

////////////// MIDDLEWARE ////////////////////////////

/////////////// ROUTES ///////////////////////////////////

  router.put('/account', UserController.ensureAuthenticated, UserController.accountPut);
  router.delete('/account', UserController.ensureAuthenticated, UserController.accountDelete);
  router.post('/signup', UserController.signupPost);
  router.post('/activate/:token', UserController.activateAccount);
  router.post('/login', UserController.loginPost);
  router.post('/forgot', UserController.forgotPost);
  router.post('/reset/:token', UserController.resetPost);
  router.get('/users', UserController.getUsers);
  router.get('/userPoints', PointController.getUsersPoints);
  router.get('/userVotes', PointController.getUserVotes);
  router.get('/userPoints/:id', PointController.getUserPoints);
  router.post('/point', PointController.createUserPoint);
  router.delete('/point/:toUser/:pointType', PointController.removeUserPoint);
  router.get('/stats', StatController.getStats);

  module.exports = router;

})();
