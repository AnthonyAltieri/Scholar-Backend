/**
 * @author Anthony Altieri on 11/5/16.
 */

const Questions = (state = [], action) => {
  switch (action.type) {
    case 'RECEIVED_QUESTIONS': {
      return action
        .questions
        .filter(q => !q.isDismissed);
    }

    case 'JOINED_COURSESESSION': {
      if (state.length === 0) return [];
      const question = state[0];
      if (question.id !== action.id) {
        return [];
      }
    }

    case 'ADDED_QUESTION': {
      return [...state, action.question]
    }

    case 'DISMISSED_QUESTION': {
      return state
        .filter(q => q.id !== action.id);
    }

    case 'VOTE_QUESTION': {
      const question = state.filter(q => q.id === action.id);
      const otherQuestions = state.filter(q => q.id !== action.id);
      question.votes = [...question.votes, action.vote];


    }

    default: {
      return state;
    }
  }
};

export default Questions;
