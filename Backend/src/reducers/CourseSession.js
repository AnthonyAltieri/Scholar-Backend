/**
 * @author Anthony Altieri on 11/5/16.
 */

import { combineReducers } from 'redux';
import id from './CourseSessionId';
import Questions from './Questions';

const CourseSession = combineReducers({
  id,
  Questions,
});

export default CourseSession;
