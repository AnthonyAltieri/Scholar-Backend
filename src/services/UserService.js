import mongoose from 'mongoose';
import UserSchema from '../schemas/User';
import db from '../db';
import md5 from '../../node_modules/blueimp-md5/js/md5.js'
import { v1 } from 'node-uuid';
import SchoolService from '../services/SchoolService'
import PasswordUtil from '../utilities/PasswordUtil'
const SALT = '620';
const DEMO_COURSE_SESSION_ID = '12345-12345-12345-12345';
const User = mongoose.model('users', UserSchema);

async function getById(userId) {
  try {
    return await db.findById(userId, User);
  } catch(e) {
    return null;
  }
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
      phone: user.phone,
      institutionId: user.institutionId,
      email: user.email,
      schoolId: user.schoolId,
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

    const result = await isValidNewStudent(email, phone);
    if (!result.validStudent) return result;
    const schoolFound = await SchoolService.findByName(school);
    if (!schoolFound) return { schoolNotFound: true };

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

async function findById(id) {
  return await db.findById(id, User)
}

async function findByPhone(phone) {
  try {
    return await db.findOne({phone : phone}, User);
  }
  catch (e) {
    console.error("[ERROR] in UserService > findByPhone : " + e);
  }
}

async function findById(userId) {
  try {
    return await db.findById(userId, User);
  } catch (e) {
    console.error('[ERROR] User Service findById', e);
    return null;
  }
}

async function isValidNewStudent(
  email,
  phone,
) {
  try {
    const emailIsInUse = await isEmailInUse(email);
    console.log('Found user with same email: ' + emailIsInUse);
    if (emailIsInUse) {
      return {
        emailInUse: true,
      }
    }
    const userByPhone = await findByPhone(phone);
    console.log('Found user with same phone number: ' + !!userByPhone);
    if (!!userByPhone) {
      return {
        phoneInUse: true,
      }
    }
    return {
      validStudent: true,
    };

  } catch (e) {
    console.error('[ERROR] User Service isValidNewStudent', e);
    return null;
  }
}

async function isEmailInUse(email) {
  try {
    const user = await findByEmail(email);
    return !!user;
  } catch (e) {
    console.error('[ERROR] User Service isEmailInuse', e);
    return null;
  }
}

async function isPhoneInUse(phone) {
  try {
    const user = await findByPhone(phone);
    return !!user;
  } catch (e) {
    console.error('[ERROR] User Service isPhoneInUse', e);
    return null;
  }
}



async function savePassword(user, password) {
  console.log('user', user);
  try {
    user.password = password;
    user.forgotPasswordCode = null;
    return await db.save(user);
  } catch (e) {
    console.error('[ERROR] User Service savePassword', e);
    return null;
  }
}

async function getByForgotPasswordCode(forgotPasswordCode) {
  try {
    return db.findOne({ forgotPasswordCode }, User);
  } catch (e) {
    console.error('[ERROR] User Service getByForgotPasswordCode', e);
    return null;
  }
}


//TODO: currently this is only used by the textRouter -
//TODO: Fix login endpoint in User Router to use this
async function attemptLogin(email, password) {
 try {
   let user = await findByEmail(email);
   if(!!user) {
     user = await db.findOne({email: email, password: PasswordUtil.encryptPassword(password, email)}, User);
     if(!!user){
       console.log("found user with pass");
       return mapToSend(user);
     }
     else {
       console.log("Incorrect PWD");
       return ({error : "incorrect password"})
     }
   } else {
     return ({error : "no account found for email"});
   }
 }
  catch (e) {
    console.error("[ERROR] UserService > attemptLogin : " + e)
  }
}

async function findByEmail(email) {
  try {
    return await db.findOne({email : email}, User);
  } catch (e) {
    console.error("[ERROR] UserService > findByEmail : " + e)
  }
}

async function saveAccountInfo(
  user,
  firstName,
  lastName,
  phone,
  institutionId,
) {
  user.firstName = firstName;
  user.lastName = lastName;
  user.phone = phone;
  user.institutionId = institutionId;
  return await db.save(user);
}

async function generateForgotPasswordCode(user) {
  user.forgotPasswordCode = v1();
  try {
    return await db.save(user);
  } catch (e) {
    console.error('[ERROR] User Service generateForgotPasswordCode', e);
    return null;
  }
}

async function createAnonymousStudent() {
  const email = v1();
  const password = v1();
  const type = 'ANONYMOUS_STUDENT';
  const UCSD_SCHOOL_ID = '70200e91-a48a-11e6-8314-3fc1f048afeb620';
  try {
    return await buildUser(
      'AnonymousFirst',
      'AnonymousLast',
      email,
      password,
      '1231231234',
      '123456789',
      UCSD_SCHOOL_ID,
      type,
      '123',
    );
  } catch (e) {
    console.error('[ERROR] User Service createAnonymousStudent', e);
  }
}

async function addStudentToDemo(userId) {
  try {

  } catch (e) {
    console.error('[ERROR] User Service addStudentToDemo', e);
  }
}

async function addInstructorToDemo(userId) {
  try {

  } catch (e) {
    console.error('[ERROR] User Service addStudentToDemo', e);
  }
}

const UserService = {
  isValidNewStudent,
  getById,
  buildUser,
  isEmailVacant,
  attemptSignUp,
  validateModel,
  mapToSend,
  attemptLogin,
  findByPhone,
  findById,
  findByEmail,
  saveAccountInfo,
  generateForgotPasswordCode,
  getByForgotPasswordCode,
  savePassword,
  createAnonymousStudent,
  addStudentToDemo,
  addInstructorToDemo,
};


export default UserService;