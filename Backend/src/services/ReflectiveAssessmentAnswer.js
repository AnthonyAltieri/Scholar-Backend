import mongoose from 'mongoose';
import ReflectiveAnswerSchema
  from '../schemas/ReflectiveAssessmentAnswer';

const ReflectiveAnswer = mongoose
  .model('reflectiveassessmentanswers', ReflectiveAnswerSchema);

async function getByUserId(userId) {
  try {
    return await db.find({ userId }, ReflectiveAnswer);
  } catch (e) {
    console.error(
      '[ERROR] ReflectiveAssessmentAnswer Service getByUserId',
      e
    );
    return null;
  }
}

async function getByAssessmentId(assessmentId) {
  try {
    return await db.find({ assessmentId }, ReflectiveAnswer);
  } catch (e) {
    console.error(
      '[ERROR] ReflectiveAssessmentAnswer Service getByAssessmentId',
      e
    )
  }

}

export default {
  getByUserId,
  getByAssessmentId,
}
