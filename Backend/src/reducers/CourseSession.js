/**
 * @author Anthony Altieri on 11/5/16.
 */

const CourseSession = (state, action) => {
  switch (action.type) {
    case 'JOIN_COURSESESSION': {
      return {
        id: action.id,
      }
    }

    case 'LEFT_COURSESESSION': {
      return {}
    }

    default: {
      return state;
    }
  }
};

export default CourseSession;
