import mongoose from 'mongoose';
import UserSchema from '../schemas/User';
const User = mongoose.model('users', UserSchema);
import db from '../db';
import md5 from '../../node_modules/blueimp-md5/js/md5.js'
const SALT = '620';

import SchoolService from '../services/SchoolService'
import PasswordUtil from '../utilities/PasswordUtil'

async function getById(userId) {
  try {
    return await db.findById(userId, User);
  } catch(e) {
    return null;
  }
}

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
  if (!user) return null;
  return {
    user: {
      id: user.id,
      type: user.type,
      firstName: user.firstName,
      lastName: user.lastName,
    }
  }
}

function validateModel(user){
  //TODO: Call the user validation
  return true;
}


async function isEmailVacant(email) {
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

/**
 * Attempts to create a user in the database
 *
 * @param firstName
 * @param lastName
 * @param email
 * @param password
 * @param phone
 * @param institutionId
 * @param schoolId
 * @param type
 * @param referralCode
 * @returns user if successful and null if there was an error
 */
async function attemptSignUp(
  firstName,
  lastName,
  email,
  password,
  phone,
  institutionId,
  schoolId,
  type,
  referralCode
) {
  // check if valid email/password
  try {
    const user = await db.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      institutionId,
      schoolId,
      type,
      referralCode,
    }, User);
    return user;
  }
  catch (error) {
    return null;
  }
}

/**
 * Checks to determine if the credentials are in use and valid
 *
 * @returns an {user} if the build was successful
 * or an {emailInUse:true} if the email is in use or
 * an {schoolNotFound:true} if the school was not found
 */
async function buildUser(
  firstName,
  lastName,
  email,
  password,
  phone,
  institutionId,
  school,
  userType,
  referralCode
) {
  try {
    UserService.validateModel();

    const encryptedPassword = PasswordUtil.encryptPassword(password, email);

    const isEmailVacant = await UserService.isEmailVacant(email);

    if (!isEmailVacant) {
      return {
        emailInUse: true,
      }
    }
    const schoolFound = await SchoolService.findByName(school);

    if (!schoolFound) {
      return {
        schoolNotFound: true,
      }
    }

    const user = await attemptSignUp(
      firstName,
      lastName,
      email,
      encryptedPassword,
      phone,
      institutionId,
      schoolFound.id,
      userType,
      referralCode
    );
    return UserService.mapToSend(user);
  }
  catch (error){
    throw error;
  }


}

const UserService = {
  getById,
  buildUser,
  isEmailVacant,
  attemptSignUp,
  validateModel,
  mapToSend,
};



export default UserService;