'use strict';

import VoteService from '../services/Vote';
import express from 'express';
import Socket from '../services/Socket';
import Events from '../services/Events';
const router = express.Router();

// Votes on a question
router.post('/question/add', questionAdd);
router.post('/response/add')

export function questionAdd(req, res) {
  addQuestionResponse(req, res, 'QUESTION');
}

export function responseAdd(req, res) {
  addQuestionResponse(req, res, 'RESPONSE');
}

async function addQuestionResponse (req, res, type) {
  const {
    userId,
    courseId,
    courseSessionId,
    targetType,
    targetId,
    type,
  } = req.body;
  try {
    const vote = await VoteService.build(
      userId,
      courseId,
      courseSessionId,
      targetType,
      targetId,
      type,
    );
    let response;
    if (type === 'QUESTION') {
      response = await VoteService.addToQuestion(targetId, vote);
    } else if (type === 'RESONSE') {
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
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.ADD_VOTE,
      {
        targetId,
        vote: VoteService.mapToSend(vote),
      }
    );
    res.end();
  } catch (e) {
    res.error();
  }
}

export async function remove(req, res, type) {
  const { id, userId } = req.body;
  try {
    let result;
    if (type === 'QUESTION') {
      result = Vote.removeFromQuestion(id, userId);
    } else if (type === 'RESPONSE') {
      result = Vote.removeFromResponse(id, userId);
    } else {
      console.error(`Invalid type: ${type}`);
      res.error();
      return;
    }
    if (!result) {
      res.error();
      return;
    }
    const { courseSessionId, voteId } = result;
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.REMOVE_VOTE,
      {
        id: voteId,
      }
    );
    res.end();
  } catch (e) {
    res.error();
  }
}



module.exports = router;
