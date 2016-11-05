import mongoose from 'mongoose';
import UserSchema from '../schemas/User';
const User = mongoose.model('users', UserSchema);
import db from '../db';

class UserService {
  constructor () {};

  /**
   * Notifies all clients that are logged on to a particular username that another client 
   * has logged on with the same username
   * 
   * @param username {String} - The username that is being logged on with
   * @param io {Object} - socket io object
   */
  static notifyLogIn(username, io) {
    
    io.sockets.emit(username, {});
  }
  
  static leaveCurrentCourseSession(userId) {
    db.findById(userId, User)
      .then((user) => {
        user.inCourseSession = '';
        db.save(user)
      })
  }



}

module.exports = UserService;