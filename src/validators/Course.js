/**
 * @author Anthony Altieri on 11/5/16.
 */

import { regexValidate, idValidate, required } from './Validation';

const validateTerm = (v) => {
  switch (m) {
    case 'other':
    case 'qFall':
    case 'qWinter':
    case 'qSpring':
    case 'sFall':
    case 'sWinter':
    case 'summer': {
      return;
    }

    default: {
      throw new Error(`[VALIDATION] Course has invalid term ${v}`);
    }
  }
};

export default validateModel = (m) => {
  const { term } = m;
  idValidate(m);
  required({ term });
  validateTerm(term);
};


