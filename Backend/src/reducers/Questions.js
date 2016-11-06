/**
 * @author Anthony Altieri on 11/5/16.
 */

const Questions = (state = [], action) => {
  switch (action.type) {
    case 'RECEIVED_QUESTIONS': {
      return action.questions;
    }

    case 'JOINED_COURSESESSION': {
      if (state.length === 0) return [];
      const question = state[0];
      if (question.id !== action.id) {
        return [];
      }
    }

    default: {
      return state;
    }
  }
};

export default Questions;
