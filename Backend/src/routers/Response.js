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
  try {
    const response = await ResponseService
      .build(
        content,
        userId,
        courseId,
        courseSessionId,
        parentId,
        rootQuestionId,
        parentType,
      );
    // Socket.send(
    //   Socket.generatePrivateChannel(courseSessionId),
    //   Events.ADD_RESPONSE,
    //   ResponseService.mapToSend(response)
    // );
    res.success();
  } catch (e) {
    console.error('[ERROR] /api/response/create', e);
    res.error();
  }
}

async function dismiss(req, res) {
  const { responseId, courseSessionId } = req.body;
  try {
    const response = await ResponseService.dismiss(responseId);
    if (!response) {
      res.error();
    }
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.RESPONSE_REMOVED,
      { id: responseId }
    );
    res.success();
  } catch (e) {
    console.error('[ERROR] Response Router dismiss', e);
    res.error();
  }
}

async function endorseAdd(req, res) {
  const {
    responseId,
    userId,
    courseSessionId
  } = req.body;
  try {
    const id = await ResponseService.endorseAddResponse(responseId, userId);
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
  const { responseId, courseSessionId } = req.body;
  try {
    const id = await ResponseService.endorseRemoveResponse(responseId);
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
  const { responseId, courseSessionId } = req.body;
  try {
    const id = await ResponseService.flagAdd(responseId);
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
  const { responseId, courseSessionId } = req.body;
  try {
    const id = await ResponseService.flagRemove(responseId);
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

export default router;
