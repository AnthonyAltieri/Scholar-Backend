import db from '../db';
import mongoose from 'mongoose';
import CourseSessionService from './CourseSessionService';
import InstantAssessmentSchema from '../schemas/InstantAssessment';
const InstantAssessment = mongoose
  .model('instantassessments', InstantAssessmentSchema);

async function create(
  courseId,
  courseSessionId,
  creatorId,
  question,
  bankId,
  options,
) {
  try {
    const instantassessment = await db.create({
      courseId,
      courseSessionId,
      creatorId,
      question,
      bankId,
      options,
    }, InstantAssessment);
    await CourseSessionService.setActiveAssessment(
      courseSessionId,
      instantassessment.id,
      'INSTANT',
    );
    return instantAssessment.id;
  } catch (e) {
    console.error('[ERROR] InstantAssessment Service create', e);
    return null;
  }
}

async function deactivate(courseSessionId) {
  try {
    await CourseSessionService.removeActiveAssessment(courseSessionId);
    return courseSessionId;
  } catch (e) {
    console.error('[ERROR] InstantAssessment Service deactivate', e);
    return null;
  }
}

export default {
  create,
  deactivate,
}