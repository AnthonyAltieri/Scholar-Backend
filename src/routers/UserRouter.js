import md5 from '../../node_modules/blueimp-md5/js/md5.js'
import UserSchema from '../schemas/User';
import db from '../db';
import PasswordUtil from '../utilities/PasswordUtil';
import nodemailer from 'nodemailer';
import templateGenerator from '../ForgotPasswordEmail';
import AssessmentBankService from '../services/AssessmentBank';
import ForgotPasswordEmail from '../ForgotPasswordEmail';
import initLogger from '../logger';
const logger = initLogger();

/*
User Constants
 */

var mongoose = require('mongoose');
const User = mongoose.model('users', UserSchema);
const TYPE_STUDENT = "STUDENT";
const TYPE_INSTRUCTOR = "INSTRUCTOR";

var express = require('express');
var router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'no-reply@crowdconnect.io',
    pass: 'ManCheetah888',
  }
});

import UserService from '../services/UserService'
import SchoolService from '../services/SchoolService'

router.post('/logIn', logIn);
router.post('/logIn/anonymous/student', logInAnonymousStudent);
router.post('/logOut', logOut);
router.post('/signUp/student', signUpStudent);
router.post('/signUp/instructor', signUpInstructor);
router.post('/get/accountInfo', getAccountInfo);
router.post('/save/accountInfo', saveAccountInfo);
router.post('/request/forgotPassword', requestForgotPassword);
router.post('/change/password', changePassword);
router.post('/format/phones', formatPhones);

/**
 * @description
 * Attempts to log in with credentials, if an account is found that corresponds
 * with the credentials provided a session will be created
 *
 * @body
 *  - email: The email that is the username associated with the user's account
 *  - password: The unencrypted password associated with the user's account
 */
function logIn(req, res) {
  const { email, password } = req.body;
  const encryptedPassword = PasswordUtil.encryptPassword(password, email);
  db.findOne({ email: email }, User)
    .then((user) => {
      db.findOne({
        email: email,
        password: encryptedPassword
      }, User)
        .then((user) => {
          if (!user) {
            db.findOne({email: email}, User)
              .then((user) => {
                //User found with the email provided, but password is incorrect
                if(!!user) {
                  res.send({incorrectPassword: true})
                  return;
                }
                else{
                  res.send({});
                  return;
                }
              })
              .catch((e) => {
                console.error("[ERROR] in UserRouter > login (A) : " + e);
              });
          }
          else {
            console.info("Guess we found user");
            console.info(JSON.stringify(user));

            req.session.userName = email;
            req.session.firstName = user.firstName;
            req.session.lastName = user.lastName;
            req.session.userType = user.type;
            req.session.userId = user.id;

            const name = `${user.firstName} ${user.lastName}`;
            const type = user.type;

            user.loggedIn = true;

            db.save(user)
              .then((user) => {
                console.log("[SUCCESS] Login Success");
                res.send(UserService.mapToSend(user))
              })
              .catch((error) => {
                console.error("[ERROR] in UserRouter > login (B) : " + error);
                res.error(error)
              });
          }
        })
        .catch(error => {
          console.error("[ERROR] in UserRouter > login (C) : " + error);
          res.error(error);
        })
    })
    .catch(error => {
      switch(error) {
        case db.NOT_FOUND:
          res.error("User Not Found");
          break;

        default:
          res.error("Unknown Error from Database");
          break;
      }
    });
}

async function logInAnonymousStudent(req, res) {
  try {
    const user = await UserService.createAnonymousStudent();
  } catch (e) {
    console.error('[ERROR] User Router logInAnonymousStudent', e);
    res.error();
  }
}

 async function signUpStudent(req, res) {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      institutionId,
      school
    } = req.body;

    try {
      const result = await UserService
        .buildUser(
          firstName,
          lastName,
          email,
          password,
          phone,
          institutionId,
          school,
          TYPE_STUDENT
        );
      res.send(
        !!result ? result : { error: 'Server Error' }
      );
    }
    catch (error) {
      res.error();
    }
}

async function signUpInstructor(req, res){
  const  {
    firstName,
    lastName,
    email,
    password,
    phone,
    institutionId,
    school,
    referralCode
  } = req.body;

  try {
    const user = await UserService
      .buildUser(
        firstName,
        lastName,
        email,
        password,
        phone,
        institutionId,
        school,
        TYPE_INSTRUCTOR,
        referralCode
      );
    const { emailInUse, schoolNotFound, createdUser } = result;
    if (!!emailInUse) {
      res.send({ emailInUse });
      return;
    }
    if (!!schoolNotFound) {
      res.send({ schoolNotFound });
      return
    }
    const assessmentBank = await AssessmentBankService
      .create(createdUser.id);
    res.send({ user: createdUser })
  } catch (e) {
    console.error('[ERROR] Router User signUpInstructor', e);
    res.error();
  }
}


function logOut(req, res) {
  const { userId } = req.session;

  db.findById(userId, User)
    .then(user => {
      user.loggedIn = false;
      db.save(user)
        .then(user => {
          req.session.destroy(error => {
            if (error) {
              res.error(error);
              return
            }
            res.send();
          })
        })
        .catch(error => { res.error(error) })
    })
    .catch(error => { res.error(error) })
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) {
    res.send({
      invalidRecipient: true,
    });
    return;
  }
  try {
    const user = await db.findOne({ email }, User);
    if (!user) {
      res.send({
        invalidRecipient: true,
      });
      return;
    }
    const resetCode = v1();
    user.passwordResetCode = resetCode;
    const savedUser = await db.save(user);
    const mailOptions = {
      from: '"CrowdConnect" <no-reply@crowdconnect.io>',
      to: email,
      subject: 'Reset password for Scholar account',
      text: 'Please follow the link to reset your email',
      html: templateGenerator(resetCode),
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.send({
          error: true,
        })
        console.log('email sent successfully, info', info);
        return;
      }
      res.send({
        success: true,
      })
    })

  } catch (e) {

  }
  db.findOne({ email }, User)
    .then((user) => {
      db.save(user)
        .then((user) => {
          console.log('mark5')
        })
        .catch((error) => {
          console.log('SAVE ERROR', error)
        })
    })
}

async function getAccountInfo(req, res) {
  const { userId } = req.body;
  try {
    const user = await UserService.getById(userId);
    if (!user) {
      res.send({
        noUserFound: true,
      });
      return;
    }
    console.log('found user', user);
    const accountInfo = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      institutionId: user.institutionId,
    };
    res.send({
      accountInfo,
    })
  } catch (e) {
    console.error('[ERROR] User Router getAccountInfo', e);
    res.error();
  }
}

async function saveAccountInfo(req, res) {
  const {
    firstName,
    lastName,
    phone,
    institutionId,
    userId,
  } = req.body;
  try {
    const user = await UserService.getById(userId);
    if (!user) {
      res.send({
        noUserFound: true,
      });
      return;
    }
    const userByPhone = await UserService.findByPhone(phone);
    if (!!userByPhone && userByPhone.id !== userId) {
      res.send({
        phoneInUse: true,
      });
      return;
    }
    const savedUser = await UserService.saveAccountInfo(
      user,
      firstName,
      lastName,
      phone,
      institutionId
    );
    res.success();
  } catch (e) {
    console.error('[ERROR] User Router saveAccountInfo', e);
  }
}

async function requestForgotPassword(req, res) {
  const { email } = req.body;
  try {
    const user = await UserService.findByEmail(email);
    if (!user) {
      res.send({
        userNotFound: true,
      });
      return;
    }
    const savedUser = await UserService.generateForgotPasswordCode(user);
    const from = '"CrowdConnect Team" \<no-reply@crowdconnect.io\>';
    console.log('forgotPasswordCode', savedUser.forgotPasswordCode);
    const mailOptions = {
      from,
      to: email,
      subject: 'Forgot Password Scholar',
      html: ForgotPasswordEmail(savedUser.forgotPasswordCode),
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error('[ERROR] nodemailer', error);
      }
      console.log('Message sent: ' + info.response);
    });
    res.success();
  } catch (e) {
    console.error('[ERROR] User Router requestForgotPassword', e);
    res.error();
  }
};

async function changePassword(req, res) {
  const { password, forgotPasswordCode } = req.body;
  try {
    const user = await UserService.getByForgotPasswordCode(forgotPasswordCode);
    if (!user) {
      res.send({
        userNotFound: true,
      });
      return;
    }
    const savedUser = await UserService.savePassword(
      user,
      PasswordUtil.encryptPassword(password, user.email)
    );
    if (!savedUser) {
      res.error();
      return;
    }
    res.success();
  } catch (e) {
    console.error('[ERROR] User Router changePassword', e);
    res.error();
  }
}

async function formatPhones(req, res) {
  try {
    const { secret } = req.body;

    console.log("Formatting phones");

    if(secret === "ManCheetah888") {

      const formatPhone = (phone) => {
        let formattedPhone = phone;
        formattedPhone = formattedPhone.replace('-', '');
        formattedPhone = formattedPhone.replace('_', '');
        formattedPhone = formattedPhone.replace(' ', '');
        formattedPhone = formattedPhone.replace('(', '');
        formattedPhone = formattedPhone.replace(')', '');
        formattedPhone = formattedPhone.replace('+', '');
        formattedPhone = formattedPhone.trim();
        return formattedPhone;
      };

      let users = await db.findAll(User);

      for(let user of users) {
          if(!!user.phone) {
            console.log(user.phone);
            let phone = user.phone;
            user.phone = formatPhone(phone);
            console.log(user.phone);
            await db.save(user);
          }
      }

      res.success();
    }
    else {
      res.send({});
    }
  }
  catch (e) {
    console.error("[ERROR] UserRouter > FormatPhones ", e);
  }
}

module.exports = router;
