/**
 * @author Anthony Altieri on 11/15/16.
 */

import mongoose from 'mongoose';
import ResponseSchema from '../schemas/Response'
const Response = mongoose.model('responses', ResponseSchema);
import db from '../db';

async function build(
  content,
  userId,
  courseId,
  courseSessionId,
  parentId,
  rootQuestionId,
  parentType,
) {
  try {
    return await db.create({
      content,
      userId,
      courseId,
      courseSessionId,
      parentId,
      rootQuestionId,
      parentType,
      votes: [],
      isDismissed: false,
      isEndorsed: false,
      isFlagged: false,
      created: new Date().getTime(),
    }, Response);
  } catch (e) {
    console.error('[ERROR] ResponseService', e);
    return null;
  }
}

async function dismiss(id) {
  console.log('Response Service dismiss(' + id + ')');
  try {
    const response = await db.findById(id, Response);
    if (!response) {
      console.error('[ERROR] Response Service dismiss db.findById');
      return null;
    }
    response.isDismissed = true;
    const savedResponse = await db.save(response);
    return savedResponse.id;
  } catch (e) {
    console.error('[ERROR] Response Service dismiss', e);
    return null;
  }
}

async function endorseAdd(id, userId) {
  try {
    const response = await db.findById(id, Response);
    if (!response || response.isEndorsed) {
      return null;
    }
    response.isEndorsed = true;
    response.endorsedBy = userId;
    const savedResponse = await db.save(response);
    return savedResponse.id;
  } catch (e) {
    return null;
  }
}

async function endorseRemove(id) {
  try {
    const response = await db.findById(id, Response);
    if (!response|| !response.isEndorsed) {
      return null;
    }
    response.isEndorsed = false;
    response.endorsedBy = null;
    const savedResponse = await db.save(response);
    return savedResponse.id;
  } catch (e) {
    return null;
  }
}

async function flagAdd(id) {
  try {
    const response = await db.findById(id, Response);
    if (!response) {
      return null;
    }
    response.isFlagged = true;
    const savedResponse = await db.save(response);
    return savedResponse.id;
  } catch (e) {
    return null;
  }
}

async function flagRemove(id) {
  try {
    const response = await db.findById(id, Response);
    if (!response) {
      return null;
    }
    response.isFlagged = false;
    const savedResponse = await db.save(response);
    return savedResponse.id;
  } catch (e) {
    return null;
  }
}

async function findByRootQuestionId(rootQuestionId) {
  try {
    return await db.find({ rootQuestionId }, Response);
  } catch (e) {
    console.error('[ERROR] findByRootQuestionId', e);
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
  findByRootQuestionId,
}
