import mongoose from 'mongoose';
import UserSchema from '../schemas/User';
const User = mongoose.model('users', UserSchema);
import db from '../db';
import md5 from '../../node_modules/blueimp-md5/js/md5.js'
const SALT = '620';

import SchoolService from '../services/SchoolService'
import PasswordUtil from '../utilities/PasswordUtil'

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


async function isEmailVacant(email) {
  console.log("Is Email Valid?" + email);
  try {
    const user = await db.findOne({ email : email }, User);
    if (!!user) {
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
                        institutionId, type, referralCode) {
  // check if valid email/password
  try {
    const user = await db.create({
      firstName : firstName,
      lastName : lastName,
      email : email,
      password : password,
      phone : phone,
      institutionId : institutionId,
      type: type,
      referralCode: referralCode
    }, User);
    return user;
  }
  catch (error) {
    console.log("Error Signing up :" + error);
    return false;
  }
}

async function buildUser(  firstName,
                           lastName,
                           email,
                           password,
                           phone,
                           school,
                           userType,
                           referralCode){
  try {
    UserService.validateModel();

    const encryptedPassword = PasswordUtil.encryptPassword( password, email );

    const isEmailVacant = await UserService.isEmailVacant( email );


    let schoolFound;
    if(!!isEmailVacant){
      schoolFound = await SchoolService.findByName( school );
    }

    if (!!isEmailVacant && !!schoolFound) {
      const user =
          await attemptSignUp(
              firstName,
              lastName,
              email,
              encryptedPassword,
              phone,
              schoolFound.id,
              userType,
              referralCode
          );
      return (UserService.mapToSend(user));
    } else {
      return null;
    }
  }
  catch (error){
    throw error;
  }


}

const UserService = {
  buildUser: buildUser,
  isEmailVacant : isEmailVacant,
  attemptSignUp : attemptSignUp,
  validateModel : validateModel,
  mapToSend : mapToSend
};



export default UserService;