import mongoose from 'mongoose';
import db from '../db';

import InstantAssessmentAnswerSchema
  from '../schemas/InstantAssessmentAnswer';
const InstantAnswer = mongoose
  .model('instantassessmentanswers' ,InstantAssessmentAnswerSchema);


async function getByUserId(userId, assessmentId) {
  try {
    return (await db.find({ userId, assessmentId }, InstantAnswer))[0];
  } catch (e) {
    console
      .error(
        '[ERROR] InstantAssessmentAnswer Service getByUserId',
        e
    );
    return null;
  }
}

export default {
  getByUserId,
}
