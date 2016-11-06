/**
 * @author Anthony Altieri on 11/5/16.
 */

const User = (state = {}, action) => {
  switch (action.type) {
    case 'LOGGED_IN': {
      return {
        id: action.id,
        name: `${action.firstName} ${action.lastName}`,
        type: action.type,
      }
    }


    case 'LOGGED_OUT': {
      return {}
    }

    default: {
      return state;
    }
  }
};
