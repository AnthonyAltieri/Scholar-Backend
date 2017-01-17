'use strict';

import VoteService from '../services/Vote';
import express from 'express';
import Socket from '../services/Socket';
import Events from '../services/Events';
const router = express.Router();

// Votes on a question
router.post('/question/add', questionAdd);
router.post('/question/remove', questionRemove);
router.post('/response/add', responseAdd);
router.post('/response/remove', responseRemove);

async function questionAdd(req, res) {
  console.log('questionAdd')
  try {
    await addQuestionResponse(req, res, 'QUESTION');
  } catch (e) {
    console.error('[ERROR] Vote Router questionAdd', e);
  }
}

function responseAdd(req, res) {
  addQuestionResponse(req, res, 'RESPONSE');
}

async function addQuestionResponse (req, res, type) {
  console.log('addQuestionResponse')
  const {
    userId,
    courseId,
    courseSessionId,
    targetType,
    targetId,
  } = req.body;
  try {
    const vote = await VoteService.build(
      userId,
      courseId,
      courseSessionId,
      targetType,
      targetId,
      'UP',
    );
    console.log('vote', vote);
    let response;
    if (type === 'QUESTION') {
      response = await VoteService.addToQuestion(targetId, vote);
    } else if (type === 'RESPONSE') {
      response = await VoteService.addToResponse(targetId, vote);
    } else {
      console.error(`Invalid type: ${type}`);
      res.error();
      return;
    }
    if (!response) {
      res.error();
      return;
    }
    console.log('vote', vote);
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.ADD_VOTE,
      {
        targetId,
        vote: VoteService.mapToSend(vote),
      }
    );
    res.success();
  } catch (e) {
    console.error('[ERROR] Vote Router create', e);
    res.error();
  }
}

function questionRemove(req, res) {
  remove(req, res, 'QUESTION');
}

function responseRemove(req, res) {
  remove(req, res, 'RESPONSE');
}

export async function remove(req, res, type) {
  const { id, userId } = req.body;
  try {
    let result;
    if (type === 'QUESTION') {
      result = await VoteService.removeFromQuestion(id, userId);
    } else if (type === 'RESPONSE') {
      result = await VoteService.removeFromResponse(id, userId);
    } else {
      console.error(`Invalid type: ${type}`);
      res.error();
      return;
    }
    if (!result) {
      res.error();
      return;
    }
    const { courseSessionId , voteId } = result;
    const channel = Socket.generatePrivateChannel(courseSessionId);
    console.log('result', result);
    Socket.send(
      channel,
      Events.REMOVE_VOTE,
      {
        id,
        userId,
      }
    );
    res.success();
  } catch (e) {
    res.error();
  }
}



module.exports = router;
