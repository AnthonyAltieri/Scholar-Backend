
import db from '../db';
import mongoose from 'mongoose';
import CourseSessionService from './CourseSession';
import ReflectiveAssessmentSchema from '../schemas/ReflectiveAssessment';
import ReflectiveAnswerSchema from '../schemas/ReflectiveAssessmentAnswer';
import ReviewSchema from '../schemas/Review';
const Review = mongoose.model('reviews', ReviewSchema);
const ReflectiveAnswer = mongoose
  .model('reflectiveassessmentanswers', ReflectiveAnswerSchema);
const ReflectiveAssessment = mongoose
  .model('reflectiveassessments', ReflectiveAssessmentSchema);


async function create(
  courseId,
  courseSessionId,
  creatorId,
  question,
  bankId,
) {
  try {
    const reflectiveAssessment = await db.create({
      courseId,
      courseSessionId,
      creatorId,
      question,
      bankId,
    }, ReflectiveAssessment);
    await CourseSessionService.setActiveAssessment(
      courseSessionId,
      reflectiveAssessment.id,
      'REFLECTIVE',
    );
    return reflectiveAssessment.id;
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Service create', e);
    return null;
  }
}

async function deactivate(courseSessionId) {
  try {
    await CourseSessionService.removeActiveAssessment(courseSessionId);
    return courseSessionId;
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Service deactivate', e);
    return null;
  }
}

async function getById(assessmentId) {
  try {
    return await db.findById(assessmentId, CourseSession);
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Service getById', e);
    return null;
  }
}

async function getAnswers(assessmentId) {
  try {
    const answers = await findAll({ assessmentId }, ReflectiveAnswer);
    let answersToSend = [];
    for (let i = 0 ; i < answers.length ; i++) {
      const answer = answers[i];
      answer.reviews = await db.findByIdArray(c.reviews, Review);
      answersToSend = [
        ...answersToSend,
        answer
      ];
    }
    return answersToSend;
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Service getAnswers', e);
    return null;
  }
}

export default {
  create,
  deactivate,
  getById,
}
