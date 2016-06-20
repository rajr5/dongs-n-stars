var dotenv = require('dotenv');
var mongoose = require('mongoose');
var crypto = require('crypto');
var User = require('../app_server/models/user');

// Load environment variables from .env file
dotenv.load();

mongoose.connect(process.env.MONGODB);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

/**
 * Create a user account
 */
function createUser(name, email, password) {
  return new Promise((resolve, reject) => {
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
        name: name,
        email: email,
        password: password,
        active: true
      });
      // Save user
      user.save((err) => {
        if (err) {
          return reject(err);
        }
        resolve(user);
      });
    })
    .catch((err) => {
        reject(err);
    });
  });
}

function createUsers(numUsers) {
  return new Promise((resolve, reject) =>{
    var promises = [];
    for (var i = 0; i < numUsers; i++) {
      promises.push(createUser('user'+i, 'user'+i+'@user.com', 'password'));
    }
    Promise.all(promises)
    .then(function(data) {
      resolve(data);
    })
    .catch(function(data) {
      reject(data);
    });
    
  });
}

// Create users
createUsers(10)
.then((data) => {
  console.log('success', data);
  process.exit(0);
})
.catch((data) => {
  console.log('error', data);
  process.exit(1);
});