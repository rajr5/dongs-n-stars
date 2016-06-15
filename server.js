var express = require('express');
var path = require('path');
var logger = require('morgan');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var dotenv = require('dotenv');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var request = require('request');
var http = require('http');
var favicon = require('serve-favicon');


// Load environment variables from .env file
dotenv.load();

// Models
var User = require('./models/user');

// Controllers
var UserController = require('./controllers/user');
var PointController = require('./controllers/point');
var StatController = require('./controllers/stats');

var app = express();

mongoose.connect(process.env.MONGODB);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use(expressValidator({
 customValidators: {
    notEqual: function(value1, value2) {
        return value1 !== value2;
    }
 }
}));

app.use(function(req, res, next) {
  req.isAuthenticated = function() {
    var token = (req.headers.authorization && req.headers.authorization.split(' ')[1]) || req.cookies.token;
    try {
      return jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (err) {
      return false;
    }
  };

  if (req.isAuthenticated()) {
    var payload = req.isAuthenticated();
    User.findById(payload.sub, function(err, user) {
      req.user = user;
      next();
    });
  } else {
    next();
  }
});

app.put('/account', UserController.ensureAuthenticated, UserController.accountPut);
app.delete('/account', UserController.ensureAuthenticated, UserController.accountDelete);
app.post('/signup', UserController.signupPost);
app.post('/activate/:token', UserController.activateAccount);
app.post('/login', UserController.loginPost);
app.post('/forgot', UserController.forgotPost);
app.post('/reset/:token', UserController.resetPost);
app.get('/users', UserController.getUsers);
app.get('/userPoints', PointController.getUsersPoints);
app.get('/userVotes', PointController.getUserVotes);
app.get('/userPoints/:id', PointController.getUserPoints);
app.post('/point', PointController.createUserPoint);
app.delete('/point/:toUser/:pointType', PointController.removeUserPoint);

app.get('/stats', StatController.getStats);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'app', 'index.html'));
});

app.get('*', function(req, res) {
  res.redirect('/#' + req.originalUrl);
});

// Production error handler
if (app.get('env') === 'production') {
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.sendStatus(err.status || 500);
  });
}

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);
io.sockets.loggedIn = {}; // initialize user object
var socketHandler = require('./services/socket-server');
socketHandler.io(io); // pass in io so it is available in socketController
io.sockets.on('connection', socketHandler.socketController);

module.exports = app;
