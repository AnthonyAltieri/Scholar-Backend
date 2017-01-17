import db from '../db';
import mongoose from 'mongoose';
import CourseSessionService from './CourseSession';
import InstantAssessmentSchema from '../schemas/InstantAssessment';
const InstantAssessment = mongoose
  .model('instantassessments', InstantAssessmentSchema);
import InstantAssessmentAnswerSchema from '../schemas/InstantAssessmentAnswer';
const InstantAssessmentAnswer = mongoose
  .model('instantassessmentanswers', InstantAssessmentAnswerSchema);

async function create(
  courseId,
  courseSessionId,
  creatorId,
  question,
  bankId,
  options,
  correctOption,
) {
  console.log('courseId', courseId);
  try {
    const values = !!bankId
      ? {
        courseId,
        courseSessionId,
        creatorId,
        question,
        bankId,
        options,
        correctOption,
      }
      : {
        courseId,
        courseSessionId,
        creatorId,
        question,
        options,
        correctOption,
      }
    const instantAssessment = await db.create(values, InstantAssessment);
    console.log('instantAssessment', instantAssessment);
    await CourseSessionService.setActiveAssessment(
      courseSessionId,
      instantAssessment.id,
      'INSTANT',
    );
    return instantAssessment.id;
  } catch (e) {
    console.error('[ERROR] InstantAssessment Service create', e);
    return null;
  }
}

async function deactivate(courseSessionId, correctOption, assessmentId) {
  try {
    const instantAssessment = await getById(assessmentId);
    instantAssessment.correctOption = correctOption;
    await db.save(instantAssessment);
    await CourseSessionService.removeActiveAssessment(courseSessionId);
    return courseSessionId;
  } catch (e) {
    console.error('[ERROR] InstantAssessment Service deactivate', e);
    return null;
  }
}

async function answer(
  courseSessionId,
  userId,
  assessmentId,
  courseId,
  optionIndex,
) {
  try {
    const answer = await db.create({
      courseSessionId,
      userId,
      assessmentId,
      courseId,
      optionIndex,
    }, InstantAssessmentAnswer);
    if (!answer) {
      console.error('[ERROR] InstantAssessment Service '
        + 'answer create InstantAssessmentAnswer');
      return null;
    }
    const instantAssessment = await getById(assessmentId);
    if (!instantAssessment.answers) {
      instantAssessment.answers = [];
    }
    instantAssessment.answers = [
      ...instantAssessment.answers.filter(a => a.userId !== userId),
      answer,
    ]
    const savedInstantAssessment = await db.save(instantAssessment);
    if (!savedInstantAssessment) {
      console.error('[ERROR] InstantAssessment Service '
       + 'save instantAssessment');
       return null;
    }
    return answer;
  } catch (e) {
    console.error('[ERROR] InstantAssessment Service answer', e);
    return null;
  }

}

async function getById(instantAssessmentId) {
  try {
    return db.findById(instantAssessmentId, InstantAssessment);
  } catch (e) {
    console.error('[ERROR] InstantAssessment service getById', e);
    return null;
  }
}

async function getInCourseSession(courseSessionId) {
  try {
    return await db.find({ courseSessionId }, InstantAssessment);
  } catch (e) {
    console.error(
      '[ERROR] InstantAssessment Service getNumberInCourseSession',
      e
    );
  }
}

export default {
  create,
  deactivate,
  answer,
  getById,
  getInCourseSession,
}
