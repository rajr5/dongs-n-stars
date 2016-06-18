var clients = {};
var users = {};
var io = null;

module.exports.io = (newIo) => {
  io = newIo;
};
module.exports.socketController = (socket) => {

  // save socket conection in list
  clients[socket.id] = socket;

  /**
   * Ping user and get user information
   */
  socket.emit('user:userDetailReq', {}, function(user) {
    user.socketId = socket.id;
    users[user._id] = {
      id: user.id,
      name: user.name,
      email: user.email
    };
    // Notify all logged in users of the new user logged in list
    socket.broadcast.emit('user:loggedin', {
      loggedInUsers: users
    });
  });

  /**
   * Ask for all logged in users
   */
  socket.on('user:getLoggedInUsers', (obj, callback) => {
    console.log('user:getLoggedInUsers socket event received');
    callback({
      loggedInUsers: users
    });
  });

  /**
   * New account was activated. Broadcast to all others that user logged in
   */
  socket.on('users:newAccountActivated', (obj) => {
    console.log('users:newAccountActivated socket event received');
    socket.broadcast.emit('users:newAccount');
  });

  /**
   * Ask for all logged in users
   */
  socket.on('user:newUserLoggedIn', (user) => {
    console.log('user:newUserLoggedIn socket event received');
    console.log('user connected...');
    users[user._id] = {
      id: user.id,
      name: user.name,
      email: user.email
    };
    // Notify all logged in users of the new user logged in list
    socket.broadcast.emit('user:loggedin', {
      loggedInUsers: users
    });
  });

  /**
   * Remove user from list of logged in users
   * Notify all users that a user left
   */
  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete clients[socket.id];
    for(var user in users) {
      if (users[user].socketId === socket.id) {
        delete users[user];
      }
    }
    // Notify all logged in users of the new user logged in list
    io.emit('user:loggedin', {
      loggedInUsers: users
    });
  });

  /**
   * When a point is added/removed, notify all users
   */
  socket.on('point:change', (userVote) => {
    console.log('point:change socket event received');
    socket.broadcast.emit('point:change', {
      userVote: userVote
    });
  });

  socket.on('point:messageVote', (userVote) => {
    console.log('point:messageVote received');
    socket.broadcast.emit('point:newMessageVote', userVote);
  });
};
