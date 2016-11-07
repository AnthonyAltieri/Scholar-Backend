import mongoose from 'mongoose';
import UserSchema from '../schemas/User';
const User = mongoose.model('users', UserSchema);
import db from '../db';
import md5 from '../../node_modules/blueimp-md5/js/md5.js'
const SALT = '620';

/**
 * Notifies all clients that are logged on to a particular username that another client
 * has logged on with the same username
 *
 * @param username {String} - The username that is being logged on with
 * @param io {Object} - socket io object
 */
function notifyLogIn(username, io) {

  io.sockets.emit(username, {});
}

function leaveCurrentCourseSession(userId) {
  db.findById(userId, User)
    .then((user) => {
      user.inCourseSession = '';
      db.save(user)
    })
}

function mapToSend(user){
  if(!!user){
    return {
      id : user.id,
      type : user.type,
      firstName : user.firstName,
      lastName : user.lastName};
  }
  else return false;

}

function validateModel(user){
  //TODO: Call the user validation
  console.log("Validating User Model");
  return true;
}




function encryptPassword(password, email){
  return md5(password, null, true) + email + SALT;
}

async function isEmailVacant(email) {
  try {
    const user = await db.findOne({ email : email }, User);
    if (user) {
      console.error("ERROR : Email already in use");
      return false;
    }else {
      return true;
    }
  } catch (e) {
    console.error('database error');
    return false;
  }
}

async function attemptSignUp( firstName, lastName, email, password, phone,
                        institutionId, type) {
  // check if valid email/password
  try {
    const user = await db.create({
      firstName : firstName,
      lastName : lastName,
      email : email,
      password : password,
      phone : phone,
      institutionId : institutionId,
      type: type
    }, User);
    return user;
  }
  catch (error) {
    console.log("Error Signing up :" + error);
    return false;
  }
}


const UserService = {
  isEmailVacant : isEmailVacant,
  attemptSignUp : attemptSignUp,
  encryptPassword : encryptPassword,
  validateModel : validateModel,
  mapToSend : mapToSend
};



export default UserService;