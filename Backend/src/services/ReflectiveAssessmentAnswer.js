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
