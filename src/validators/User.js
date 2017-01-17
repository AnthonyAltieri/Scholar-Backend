/**
 * @author Anthony Altieri on 11/3/16.
 */

import { regexValidate, idValidate, required } from './Validation';

const validateId = (m) => {
  idValidate(m, 'User');
};

const validatePhone = (v) => {
  const regEx = /\d{3}-\d{3}-\d{4}/;
  regexValidate(v, regEx, 'phone');
};

const validateEmail = (v) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  regexValidate(v, regEx, 'email');
};

const validatePassword = (p) => {
  if (!p) {
    throw new Error('[VALIDATION] password is undefined');
  }
  if (p.length < 6) {
    throw new Error('[VALIDATION] password has a length less than 6');
  }
};

const validateName = (n, isFirst) => {
  if (!n) {
    throw new Error(`[VALIDATION] ${inFirst ? 'first' : 'last'} name is undefined`);
  }
  if (n.length === 0) {
    throw new Error(`[VALIDATION] ${inFirst} ? 'first' : 'length'} name has a length of 0`);
  }
};

const validateLoggedIn = (v) => {
  required(v, 'loggedIn');
};

const validateType = (v) => {
  switch (v) {
    case 'STUDENT':
    case 'INSTRUCTOR':
    case 'ADMIN':
    case 'STUDENT_REP': {
      return;
    }

    default: {
      throw new Error(`[VALIDATION] User has invalid type ${v}`);
    }
  }
};


export default validateModel = (m) => {
  const { email, phone, password, loggedIn, type
  } = m;
  validateId(m);
  required({
    email,
    password,
    loggedIn,
    type,
  });
  validateEmail(email);
  validatePhone(phone);
  validatePassword(password);
  validateLoggedIn(loggedIn);
  validateType(type);
};


