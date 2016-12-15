
import db from '../db';
import mongoose from 'mongoose';
import CourseSessionService from './CourseSession';
import ReflectiveAssessmentSchema from '../schemas/ReflectiveAssessment';
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
