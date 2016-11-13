/**
 * @author Anthony Altieri on 11/12/16.
 */

import mongoose from 'mongoose';
import QuestionSchema from '../schemas/QuestionSchema';
const Question = mongoose.model('users', QuestionSchema);
import db from '../db';

import validateQuestion from '../validators/Question';

export async function buildQuestion(
  content,
  userId,
  courseId,
  courseSessionId
) {
  try {
    validateQuestion(content, userId, courseId, courseSessionId);
    const question = await db.create({
      content,
      userId,
      courseId,
      courseSessionId,
      created: new Date.UTC(),
    }, Question);
    return question;
  } catch (e) {
    return null;
  }
};


export default {
  buildQuestion,
}
