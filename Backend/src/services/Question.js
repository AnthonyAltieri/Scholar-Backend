/**
 * @author Anthony Altieri on 11/12/16.
 */

import mongoose from 'mongoose';
import QuestionSchema from '../schemas/QuestionSchema';
const Question = mongoose.model('questions', QuestionSchema);
import db from '../db';

import validateQuestion from '../validators/Question';

export async function build(
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
      isDismissed: false,
      isEndorsed: false,
      isFlagged: false,
      created: new Date.UTC(),
    }, Question);
    return question;
  } catch (e) {
    return null;
  }
}

async function dismiss(id) {
  try {
    const question = await db.findById(id, Question);
    question.isDismissed = true;
    const savedQuestion = await db.save(question);
    return savedQuestion.id;
  } catch (e) {
    return null;
  }
}

async function endorseAdd(id, userId) {
  try {
    const question = await db.findById(id, Question);
    if (!question || question.isEndorsed) {
      return null;
    }
    question.isEndorsed = true;
    question.endorsedBy = userId;
    const savedQuestion = await db.save(question);
    return savedQuestion.id;
  } catch (e) {
    return null;
  }
}

async function endorseRemove(id) {
  try {
    const question = await db.findById(id, Question);
    if (!question || !question.isEndorsed) {
      return null;
    }
    question.isEndorsed = false;
    question.endorsedBy = null;
    const savedQuestion = await db.save(question);
    return savedQuestion.id;
  } catch (e) {
    return null;
  }
}

async function flagAdd(id) {
  try {
    const question = await db.findById(id, Question);
    if (!question) {
      return null;
    }
    question.isFlagged = true;
    const savedQuestion = await db.save(question);
    return question.id;
  } catch (e) {
    return null;
  }
}

async function flagRemove(id) {
  try {
    const question = await db.findById(id, Question);
    if (!question) {
      return null;
    }
    question.isFlagged = false;
    const savedQuestion = await db.save(question);
    return question.id;
  } catch (e) {
    return null;
  }
}

function mapToSend(question) {
  return {
    id: question.id,
    content: question.content,
    userId: question.userId,
    courseSessionId: question.courseSessionId,
    created: question.created,
  }
}

export default {
  build,
  dismiss,
  endorseAdd,
  endorseRemove,
  flagAdd,
  flagRemove,
  mapToSend,
}
