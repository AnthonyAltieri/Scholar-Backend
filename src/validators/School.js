/**
 * @author Anthony Altieri on 11/5/16.
 */

import { regexValidate, idValidate, required } from './Validation';

const validateTermType = (v) => {
  switch (v) {
    case 'quarter':
    case 'semester':
    case 'trimester': {
      return;
    }

    default: {
      throw new Error(`[VALIDATION] Invalid type ${v}`)
    }
  }
};

export default validateModel = (m) => {
  idValidate(m);

};