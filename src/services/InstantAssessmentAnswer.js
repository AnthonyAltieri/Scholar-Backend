import mongoose from 'mongoose';
import db from '../db';

import InstantAssessmentService from './InstantAssessment'
import InstantAssessmentAnswerSchema
  from '../schemas/InstantAssessmentAnswer';
const InstantAnswer = mongoose
  .model('instantassessmentanswers' ,InstantAssessmentAnswerSchema);



async function getByUserId(userId, assessmentId) {
  try {
    const assessment = await InstantAssessmentService.getById(assessmentId);
    const studentAnswer = assessment.answers.filter( (a) => a.userId === userId );
    if(!!studentAnswer[0])
      return studentAnswer[0];
    else
      return null;
    // return (await db.find({ userId, assessmentId }, InstantAnswer))[0];
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
