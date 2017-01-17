/**
 * @author Anthony Altieri on 11/5/16.
 */

export const regexValidate = (value, regEx, name) => {
  if (typeof value === 'undefined') {
    throw new Error(`[VALIDATION] ${name} is undefined`);
  }
  if (!regEx.test(value)) {
    throw new Error(`[VALIDATION] ${value} is not valid ${name}`);
  }
};

export const required = (object) => {
  const keys = Object.getKeys(object);
  keys.forEach((k) => {
    if (typeof object[k] === 'undefined') {
      throw new Error(`[VALIDATION] ${k} is required`);
    }
  })
};

export const idValidate = (value, name) => {
  if (!value.id) {
    throw new Error(`[VALIDATION] ${name} needs an id`);
  }
};
