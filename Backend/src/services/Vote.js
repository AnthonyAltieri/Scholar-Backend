/**
 * @author Anthony Altieri on 11/15/16.
 */

import mongoose from 'mongoose';
import VoteSchema from '../schemas/Vote';
import QuestionSchema from '../schemas/Question'
import ResponseSchema from '../schemas/Response'
const Vote = mongoose.model('votes', VoteSchema);
const Question = mongoose.model('questions', QuestionSchema);
const Response = mongoose.model('responses', ResponseSchema);
import db from '../db';

async function build(
  userId,
  courseId,
  courseSessionId,
  targetType,
  targetId,
  type
) {
  try {
    return await db.create({
      userId,
      courseId,
      courseSessionId,
      targetType,
      targetId,
      type,
    }, Vote);
  } catch (e) {
    console.error('[ERROR] Vote Service build', e);
    return null;
  }
}

async function addToQuestion(id, vote) {
  try {
    const question = await db.findById(id, Question);
    question.votes = !!question.votes
      ? [...question.votes.filter(v => v.userId !== vote.userId), vote]
      : [vote];
    question.rank = question.votes.length;
    console.log('question now', question);
    return await db.save(question);
  } catch (e) {
    console.error('[ERROR] Vote Service addToQuestion', e);
    return null;
  }
}

async function removeFromQuestion(id, userId) {
  try {
    const question = await db.findById(id, Question);
    const vote = question.votes.filter(v => v.userId === userId)[0];
    question.votes = question.votes.filter(v => v.userId !== userId);
    question.rank = question.votes.length;
    await db.save(question);
    console.log('vote', vote);
    return {
      courseSessionId: question.courseSessionId,
      voteId: vote.id
    }
  } catch (e) {
    return null;
  }
}

async function addToResponse(id, vote) {
  try {
    const response = await db.findById(id, Response);
    response.votes = !!response.votes
      ? [...response.votes.filter(v => v.userId !== vote.userId), vote]
      : [vote];
    response.rank = response.votes.length;
    return await db.save(response);
  } catch (e) {
    return null;
  }
}

async function removeFromResponse(id, userId) {
  try {
    const response = await db.findById(id, Response);
    response.votes = response.votes.filter(v => v.userId != userId);
    response.rank = response.votes.length;
    return await db.save(response);
  } catch (e) {
    return null;
  }
}

function mapToSend(vote) {
  return {
    id: vote.id,
    userId: vote.userId,
    courseId: vote.courseId,
    courseSessionId: vote.courseSessionId,
    targetType: vote.targetType,
    targetId: vote.targetId,
    type: vote.type,
  }
}

export default {
  build,
  addToQuestion,
  removeFromQuestion,
  addToResponse,
  removeFromResponse,
  mapToSend,
}
