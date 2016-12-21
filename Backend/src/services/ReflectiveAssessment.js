
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
      reviewStarted: false,
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
    return await CourseSessionService.removeActiveAssessment(courseSessionId);
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Service deactivate', e);
    return null;
  }
}

async function getById(assessmentId) {
  try {
    return await db.findById(assessmentId, ReflectiveAssessment);
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

async function review(
  courseSessionId,
  courseId,
  userId,
  type,
  answerId,
) {
  try {
    const review = await db.create({
      courseSessionId,
      courseId,
      userId,
      type,
      answerId,
    }, Review);
    const answer = await db.findById(answerId, ReflectiveAnswer);
    if (!answer.reviews) {
      answer.reviews = [];
    }
    answer.reviews = [
      ...answer.reviews,
      review,
    ];
    await db.save(review);
    return answer;
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Service review', e);
    return null;
  }
}

async function answer(
  courseSessionId,
  userId,
  assessmentId,
  courseId,
  content,
) {
  try {
    const answer = await db.create({
      courseSessionId,
      userId,
      assessmentId,
      courseId,
      content,
    }, ReflectiveAnswer);
    console.log('ReflectiveAssessmentAnswer', answer);
    return answer;
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Service review', e);
    return null;
  }
}

async function startReview(assessmentId) {
  try {
    const reflectiveAssessment = await getById(assessmentId);
    reflectiveAssessment.reviewStarted = true;
    await db.save(reflectiveAssessment);
    return reflectiveAssessment;
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Service startReview', e);
    return null;
  }
}

async function createVoteMatrix(assessmentId, numberExpectedReviews) {
  try {
    const retrievedAnswers = await db.findAll({ assessmentId }, ReflectiveAnswer);
    let matrix = [];
    let answers = [];
    // Helper fuction to calculate which answer's a particular
    // user will have been presented for review
    const getIndicesOfReviewed = (answerIndex, numberAnswers) => {
      let indicesOfReviewed = [];
      for (let i = 1 ; i < (numberExpectedReviews + 1) ; i++) {
        indicesOfReviewed = [
          ...indicesOfReviewed,
          ((answerIndex + i) % (numberAnswers - 1)),
        ];
      }
      return indicesOfReviewed;
    };
    for (let i = 0 ; i < retrievedAnswers.length ; i++) {
      let matrix = [...matrix, []];
      const answer = retrievedAnswers[i];
      answer.reviews = await db.findByIdArray(answer.reviews, Review);
      answers = [...answers, answer];
    };
    for (let i = 0 ; i < retrievedAnswers.length ; i++) {
      let userId = answers[i].userId;
      let row = matrix[i];
      const indiciesOfReviewed = getIndicesOfReviewed(i);
      for (let j = 0 ; j < indiciesOfReviewed.length ; j++) {
        const index = indiciesOfReviewed[j];
        const answerToExamine = answers[index];
        const userReview = answerToExamine.reviews
          .filter(r => r.userId === userId)[0];
        if (!userReview) {
          row = [...row, 0]
          continue;
        }
        row = [...row, (userReview.type === 'AGREE' ? 1 : -1)];
      }
    }
    return matrix;
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Service createVoteMatrix', e);
    return null;
  }
}

async function getInCourseSession(courseSessionId) {
  try {
    return await db.find({ courseSessionId }, ReflectiveAssessment);
  } catch (e) {
    console.error('[ERROR] Reflective Service getInCourseSession', e);
    return null;
  }
}

export default {
  create,
  deactivate,
  getById,
  review,
  answer,
  startReview,
  getInCourseSession,
}
