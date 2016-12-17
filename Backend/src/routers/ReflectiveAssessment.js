
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
router.post('/startReview', startReview);

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
      Events.ASSESSMENT_ACTIVATED,
      {
        assessmentType: 'REFLECTIVE',
        question,
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
    res.success();
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Router answer', e);
    res.error();
  }
}

async function startReview(req, res) {
  const {
    assessmentId,
    courseSessionId,
  } = req.body;
  try {
    const reflectiveAssessment = await ReflectiveAssessmentService
      .startReview(assessmentId);
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.REFLECTIVE_ASSESSMENT_START_REVIEW,
      {}
    );
    res.success();
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Router startReview');
    res.error();
  }
}

export default router;
