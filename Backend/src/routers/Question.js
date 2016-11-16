/**
 * @author Anthony Altieri on 11/12/16.
 */

import QuestionService from '../services/Question';
import Socket from '../services/Socket';
import Events from '../services/Events';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.post('/create', create);
router.post('/dismiss', dismiss);
router.post('/endorse/add', endorseAdd);
router.post('/endorse/remove', endorseRemove);
router.post('/flag/add', flagAdd);
router.post('/flag/remove', flagRemove);

async function create(req, res) {
  const {
    content,
    userId,
    courseId,
    courseSessionId,
  } = req.body;

  const question = await QuestionService
    .buildQuestion(
      content,
      userId,
      courseId,
      courseSessionId,
    );
  Socket.send(
    Socket.generatePrivateChannel(courseSessionId),
    Events.QUESTION_ASKED,
    QuestionService.mapToSend(question)
  );
  res.end();
}

async function dismiss(req, res) {
  const { id, courseSessionId } = req.body;
  try {
    const question = await QuestionService.dismissQuestion(id);
    if (!question) {
      res.end();
    }
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.QUESTION_DISMISSED,
      { id }
    );
    res.end();
  } catch (e) {
    res.error();
  }
}

async function endorseAdd(req, res) {
  const { id, userId, courseSessionId } = req.body;
  try {
    const id = await QuestionService.endorseAdd(id, userId);
    if (!id) {
      res.end();
    }
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.ADD_ENDORSE,
      { id }
    );
    res.end();
  } catch (e) {
    res.error();
  }
}

async function endorseRemove(req, res) {
  const { id, courseSessionId } = req.body;
  try {
    const id = await QuestionService.endorseRemove(id, userId);
    if (!id) {
      res.end();
    }
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.ADD_ENDORSE,
      { id }
    );
    res.end();
  } catch (e) {
    res.error();
  }
}

async function flagAdd(req, res) {
  const { id, courseSessionId } = req.body;
  try {
    const id = await QuestionService.flagAdd(id);
    if (!id) {
      res.end();
    }
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.ADD_FLAG,
      { id }
    );
    res.end();
  } catch (e) {
    res.error();
  }
}

async function flagRemove(req, res) {
  const { id, courseSessionId } = req.body;
  try {
    const id = await QuestionService.flagRemove(id);
    if (!id) {
      res.end();
    }
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.REMOVE_FLAG,
      { id }
    );
    res.end();
  } catch (e) {
    res.error();
  }
}

