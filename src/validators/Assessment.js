/**
 * @author Anthony Altieri on 11/5/16.
 */


import { regexValidate, idValidate, required } from './Validation';


export default validateModel = (m) => {
  const { courseId, courseSessionId, creatorId } = m;
  required({
    courseId,
    courseSessionId,
    creatorId,
  });
  validateId(m);
};
