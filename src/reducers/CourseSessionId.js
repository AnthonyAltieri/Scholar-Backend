/**
 * @author Anthony Altieri on 11/5/16.
 */

const CourseSessionId = (state = null, action) => {
  switch (action.type) {
    case 'JOIN_COURSESESSION': {
      return action.id;
    }

    case 'LEFT_COURSESESSION': {
      return null;
    }

    default: {
      return state;
    }
  }
};

export default CourseSessionId;
