
import express from 'express';
import mongoose from 'mongoose';
import ReflectiveAssessmentService from '../services/ReflectiveAssessment';
import Socket from '../services/Socket';
import Events from '../services/Events';

const router = express.Router();

router.post('/create', create);
router.post('/deactivate', deactivate);
router.post('/review', review);
router.post('/answer', answer);

async function create(req, res) {
  const {
    courseId,
    courseSessionId,
    creatorId,
    question,
    bankId,
  } = req.body;
  try {
    const reflectiveAssessmentId = await ReflectiveAssessmentService
      .create(
        courseId,
        courseSessionId,
        creatorId,
        question,
        bankId,
      );
    if (!reflectiveAssessmentId) {
      res.error();
      return;
    }
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.ASSESMENT_ACTIVATED,
      {
        assessmentType: 'REFLECTIVE',
        question,
        options,
      }
    )
    res.send({
      reflectiveAssessmentId,
    })
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Router create', e);
    res.error();
  }
}

async function deactivate(req, res) {
  const { courseSessionId } = req.body
  try {
    const result = await ReflectiveAssessmentService
      .deactivate(courseSessionId)
    if (!result) {
      res.error();
      return;
    }
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.ASSESSMENT_DEACTIVATED,
      {}
    )
    res.success();
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Router deactivate', e);
    res.error();
  }
}

async function review(req, res) {
  const {
    courseSessionId,
    courseId,
    userId,
    type,
    answerId,
  } = req.body;
  try {
    const answer = await ReflectiveAssessmentService
      .review(
        courseSessionId,
        courseId,
        userId,
        type,
        answerId,
      );
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.REFLECTIVE_ASSESSMENT_REVIEWED,
      {}
    );
    res.success();
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Router review', e);
    res.error();
  }
}

async function answer(req, res) {
  const {
    courseSessionId,
    userId,
    assessmentId,
    courseId,
    content,
  } = req.body;
  try {
    const answer = await ReflectiveAssessmentService
      .answer(
        courseSessionId,
        userId,
        assessmentId,
        courseId,
        content,
      );
    if (!answer) {
      console.error('[ERROR] ReflectiveAssessment Router null answer')
      res.error();
    }
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.REFLECTIVE_ASSESSMENT_ANSWERED,
      {}
    );
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Router answer', e);
    res.error();
  }
}

export default router;
