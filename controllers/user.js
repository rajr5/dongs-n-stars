var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var request = require('request');
var qs = require('querystring');
var mailerService = require('../services/mailer');
var User = require('../models/user');

function generateToken(user) {
  var payload = {
    iss: 'dong.atgdevelopment.net',
    sub: user.id,
    iat: moment().unix(),
    exp: moment().add(7, 'days').unix()
  };
  return jwt.sign(payload, process.env.TOKEN_SECRET);
}


/**
 * 200 - OK success GET
 * 201 - created success POST
 * 203 - created success PUT
 * 204 - no content success DELETE
 * 400 bad request
 * 401 unathorized
 * 403 forbidden
 * 404 not found
 * 405 method not allowed
 */

var sendJson = function(res, status, content) {
      content = content || {};
      res.status(status);
      res.json(content);
};


/**
 * Login required middleware
 */
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    sendJson(res, 401, {msg: 'Unauthorized'});
  }
};

  /**
   * GET /users
   * Sign in with email and password
   */
exports.getUsers = function(req, res) {
  User
  .find({}) // TODO -> dont return active=false (return active undefined or null)
  .select('_id name email')
  .exec((err, users) => {
    if (err) {
      sendJson(res, 401, {msg: "Could not retreive users", error: err});
    } else {
      sendJson(res, 200, users);
    }
  });
};


  /**
   * POST /login
   * Sign in with email and password
   */
  exports.loginPost = function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.assert('password', 'Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    var errors = req.validationErrors();

    if (errors) {
      return res.status(400).send(errors);
    }

    // TODO - make sure account is active
    User.findOne({ email: req.body.email }, (err, user) => {
      if (!user) {
        return sendJson(res, 401, { msg: 'The email address ' + req.body.email + ' is not associated with any account. ' +
        'Double-check your email address and try again.'
        });
      } else if(user.active === false) {
        return sendJson(res, 401, {msg: 'You must confirm your email address prior to logging in.  Please refer to the email sent when you registered.'});
      }
      user.comparePassword(req.body.password, (err, isMatch) => {
        if (!isMatch) {
          return res.status(401).send({ msg: 'Invalid email or password' });
        }
        res.send({ token: generateToken(user), user: user.toJSON() });
      });
    });
  };

/**
 * POST /signup
 */
exports.signupPost = function(req, res, next) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  User.findOne({ email: req.body.email }, (err, user) => {
    if (user) {
      return sendJson(res, 400, { msg: 'The email address you have entered is already associated with another account.' });
    }

    // Generate Activation Token
    new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        var token = buf.toString('hex');
        if (err) {
          return reject(err);
        }
        resolve(token);
      });
    })
    .then((token) => {
      // Create user
      user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        active: false,
        activationToken: token,
        activationTokenExpires: Date.now() + 604800000 // expire in 7 days
      });
      // Save user
      user.save((err) => {
        // TODO -> instead of giving token, make user confirm email account
        // TODO -> on login, check to ensure account is active
        // If token expired, give option to re-send token
        // TODO -> send email here for account confirmation
        // Send activation token
        var email= {
          to: user.email,
          from: 'support@atgdevelopment.net',
          subject: '✔ Activate your account on Dongs N Stars',
          text: 'You are receiving this email because you registered for an account on Dongs N Stars.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/activate/' + user.activationToken + '\n\n'
        };

        mailerService.sendMail(email.to, email.subject, email.text, null, email.from)
        .then((user) => {
          sendJson(res, 200, { msg: 'An email has been sent to ' + user.email + ' to confirm the email address with this account. The link will be active for 7 days' });
        })
        .catch((err) => {
          // email send failed
          sendJson(res, 401, {msg: 'Could not send activation email.  Accoutn has been created, please contact and administrator', error: err});
        });
      });
    })
    .catch((err) => {
      sendJson(res, 401, {msg: 'Failed generating activation token. Accoutn not saved, please contact an administrator', error: err});
    });
  });
};


/**
 * GET /activate/:token
 */
exports.activateAccount = function(req, res, next) {
  // finnd account with token
  User.findOne({ activationToken: req.params.token })
  .where('activationTokenExpires').gt(Date.now())
  .exec((err, user) => {
    if (err) {
      return sendJson(res, 401, {msg: 'Token is not valid'});
    }
    user.active = true;
    user.activationToken = undefined;
    user.activationTokenExpires = undefined;
    user.save((err) => {
      if (err) {
        sendJson(res, 401, { msg: 'Error activating account', error: err });
      } else {
        sendJson(res, 200, { token: generateToken(user), user: user });
      }
    });
  });
}


/**
 * PUT /account
 * Update profile information OR change password.
 */
exports.accountPut = function(req, res, next) {
  if ('password' in req.body) {
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirm', 'Passwords must match').equals(req.body.password);
  } else {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });
  }

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

  User.findById(req.user.id, (err, user) => {
    if ('password' in req.body) {
      user.password = req.body.password;
    } else {
      user.email = req.body.email;
      user.name = req.body.name;
    }
    user.save((err) => {
      if ('password' in req.body) {
        res.send({ msg: 'Your password has been changed.' });
      } else if (err && err.code === 11000) {
        sendJson(res, 409, { msg: 'The email address you have entered is already associated with another account.' });
      } else {
        sendJson(res, 200, { user: user, msg: 'Your profile information has been updated.' })
      }
    });
  });
};

/**
 * DELETE /account
 */
exports.accountDelete = function(req, res, next) {
  User.remove({ _id: req.user.id }, (err) => {
    sendJson(res, 204, { msg: 'Your account has been permanently deleted.' });
  });
};


/**
 * POST /forgot
 */
exports.forgotPost = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  var errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(errors);
  }

    new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) =>{
        var token = buf.toString('hex');
        if (err) {
          return reject(err);
        }
        resolve(token);
      });
    })
    .then((token) => {
      User.findOne({ email: req.body.email }, (err, user) =>{
        if (!user) {
          return sendJson(res, 400, { msg: 'The email address ' + req.body.email + ' is not associated with any account.' });
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // expire in 1 hour
        user.save((err) => {
          var email= {
            to: user.email,
            from: 'support@yourdomain.com',
            subject: '✔ Reset your password on Dongs N Stars',
            text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
          };
          mailerService.sendMail(email.to, email.subject, email.text, null, email.from)
          .then((info) => {
            sendJson(res, 200, { msg: 'An email has been sent to ' + user.email + ' with further instructions.' });
          })
          .catch((err) => {
            sendJson(res, 400, {msg: 'Reset token was created, but could not be emailed.'});
          });
        });
      });
    })
    .catch((err) => {
      sendJson(res, 400, {msg: 'There was an error processing the password reset request.'});
    });
};

/**
 * POST /reset
 */
exports.resetPost = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirm', 'Passwords must match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
      return sendJson(res, 400, errors);
  }
  User.findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (!user) {
        return sendJson(res, 400, { msg: 'Password reset token is invalid or has expired.' });
      }
      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.save((err) => {
        req.logIn(user, (err) => {
          var email= {
            from: 'support@atgdevelopment.net',
            to: user.email,
            subject: 'Your Dongs N Stars password has been changed',
            text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
          };
          mailerService.sendMail(email.to, email.subject, email.text, null, email.from)
          .then((info) => {
            sendJson(res, 200, { msg: 'Your password has been changed successfully.' });
          })
          .catch((err) => {
            console.log('email confirmation for password reset failed.');
            sendJson(res, 200, { msg: 'Your password has been changed successfully.' });
          });
        });
      });
    });
};
