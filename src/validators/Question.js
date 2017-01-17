/**
 * @author Anthony Altieri on 11/12/16.
 */

const validate = (content, userId, courseId, courseSessionId) => {
  const throwMissingError = (property) => {
    throw new Error(`[VALIDATION] there is no ${property}`);
  };
  if (!content) {
    throwMissingError('content');
  }
  if (!userId) {
    throwMissingError('userId');
  }
  if (!courseId) {
    throwMissingError('courseId');
  }
  if (!courseSessionId) {
    throwMissingError('courseSessionId');
  }
};

export default validate;
