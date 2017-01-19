/**
 * @flow
 * @author Anthony Altieri on 1/18/17.
 */

import winston from 'winston';

export default () => (new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'all-logs.log' }),
  ]
}));
