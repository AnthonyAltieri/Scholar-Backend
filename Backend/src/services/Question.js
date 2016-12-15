/**
 * @author Anthony Altieri on 11/12/16.
 */

import mongoose from 'mongoose';
import ResponseService from './Response';
import QuestionSchema from '../schemas/Question';
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
      created: new Date().getTime(),
    }, Question);
    return question;
  } catch (e) {
    console.error('[ERROR] QuestionService', e);
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

function mapToSend(questionOrResponse) {
  return {
    id: questionOrResponse.id,
    userId: questionOrResponse.userId,
    courseSessionId: questionOrResponse.courseSessionId,
    content: questionOrResponse.content,
    votes: questionOrResponse.votes || [],
    isFlagged: !!questionOrResponse.isFlagged,
    isEndorsed: !!questionOrResponse.isEndorsed,
    isDismissed: questionOrResponse.isDismissed,
    endorsedBy: questionOrResponse.endorsedBy || null,
    rootQuestionId: questionOrResponse.rootQuestionId || null,
    parentId: questionOrResponse.parentId || null,
    parentType: questionOrResponse.parentType || null,
    created: questionOrResponse.created,
    responses: [],
  }
}

async function findByCourseSessionId(id){
  try {
    return await db.find({courseSessionId: id}, Question);
  }
  catch (err) {
    throw err;
  }
}

function sortByCreatedTime(lhs, rhs) {
    if (lhs.created < rhs.created) {
      return 1;
    } else if (lhs.created > rhs.created) {
      return -1;
    } else {
      return 0;
    }
}

function createQuestionTree(question, responses) {
  // Create a hashmap where every element id maps to its
  // corresponding object element that has been mapped to send
  let idToElemHM = {};
  idToElemHM[question.id] = mapToSend(question);
  responses.forEach((r) => {
    idToElemHM[r.id] = mapToSend(r);
  });
  // Put all of the elements in their corresponding parent's
  // response array
  const keys = Object.keys(idToElemHM);
  keys.forEach((k) => {
    const questionOrResponse = idToElemHM[k];
    const parentId = questionOrResponse.parentId;
    if (parentId) {
      const parent = idToElemHM[questionOrResponse.parentId];
      parent.responses = [...parent.responses, questionOrResponse];
    }
  });
  // Now sort all responses by time
  keys.forEach((k) => {
    const questionOrResponse = idToElemHM[k];
    if (questionOrResponse.responses.length > 0) {
      questionOrResponse.responses.sort(sortByCreatedTime);
    }
  });
  // Return the root question
  return idToElemHM[question.id];
}

async function getQuestionTrees(courseSessionId) {
  try {
    const questions = await findByCourseSessionId(courseSessionId);
    let questionTrees = [];
    for (let i = 0 ; i < questions.length ; i++) {
      const question = questions[i];
      const allResponses = await ResponseService
        .findByRootQuestionId(question.id);
      console.log('allResponses', JSON.stringify(allResponses, null, 2))
      questionTrees = [
        ...questionTrees,
        createQuestionTree(question, allResponses),
      ]
    }
    return questionTrees;
  } catch (e) {
    console.error('[ERROR] Question Service getQuestionTrees', e);
    return null;
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
  findByCourseSessionId,
  createQuestionTree,
  getQuestionTrees,
}
