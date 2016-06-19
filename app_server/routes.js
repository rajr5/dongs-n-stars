(function(){
  'use strict';

  var express = require('express');
  var router = express.Router();

  // Controllers
  var UserController = require('./controllers/user');
  var PointController = require('./controllers/point');
  var StatController = require('./controllers/stats');

////////////// MIDDLEWARE ////////////////////////////



//////////////// HELPERS //////////////////////////////
/**
 * Login required middleware
 */
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401);
    res.json({msg: 'Unauthorized'});
  }
}

/////////////// ROUTES ///////////////////////////////////

  router.put('/account', ensureAuthenticated, UserController.accountPut);
  router.delete('/account', ensureAuthenticated, UserController.accountDelete);
  router.post('/signup', UserController.signupPost);
  router.post('/activate/:token', UserController.activateAccount);
  router.post('/login', UserController.loginPost);
  router.post('/forgot', UserController.forgotPost);
  router.post('/reset/:token', UserController.resetPost);
  router.get('/users', ensureAuthenticated, UserController.getUsers);
  
  router.get('/userPoints', ensureAuthenticated, PointController.getUsersPoints);
  router.get('/userVotes', ensureAuthenticated, PointController.getUserVotes);
  router.get('/userPoints/:id', ensureAuthenticated, PointController.getUserPoints);
  router.post('/point', ensureAuthenticated, PointController.createUserPoint);
  router.put('/userVotes/:userVoteId/:voteType', ensureAuthenticated, PointController.messageVote);
  router.delete('/point/:toUser/:pointType', ensureAuthenticated, PointController.removeUserPoint);
  
  router.get('/stats', StatController.getStats);
  

  module.exports = router;

})();
