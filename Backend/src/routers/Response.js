/**
 * @author Anthony Altieri on 11/15/16.
 */

import ResponseService from '../services/Response';
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
    userId,
    courseId,
    courseSessionId,
    content,
    rootQuestionId,
    parentId,
    parentType,
  } = req.body;
  const response = await ResponseService
    .buildResponse(
      content,
      userId,
      courseId,
      courseSessionId,
      parentId,
      rootQuestionId,
    );
  Socket.send(
    Socket.generatePrivateChannel(courseSessionId),
    Events.ADD_RESPONSE,
    ResponseService.mapToSend(response)
  );
  res.end();
}

async function dismiss(req, res) {
  const { id, courseSessionId } = req.body;
  try {
    const response = await QuestionService.dismissResponse(id);
    if (!response) {
      res.end();
    }
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.REMOVE_RESPONSE,
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
    const id = await ResponseService.endorseAddResponse(id, userId);
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
    const id = await ResponseService.endorseRemoveResponse(id);
    if (!id) {
      res.end();
    }
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.REMOVE_ENDORSE,
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
    const id = await ResponseService.flagAdd(id);
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
    const id = await ResponseService.flagRemove(id);
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
