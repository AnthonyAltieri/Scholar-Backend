import express from 'express';
import mongoose from 'mongoose';
import InstantassessmentService from '../services/InstantAssessment';
import Socket from '../services/Socket';
import Events from '../services/Events';

const router = express.Router();

router.post('/create', create);
router.post('/deactivate', deactivate);
router.post('/answer', answer);

async function create(req, res) {
  const {
    courseId,
    courseSessionId,
    creatorId,
    question,
    bankId,
    options,
    correctOption,
  } = req.body;
  try {
    const instantAssessmentId = await InstantassessmentService
      .create(
        courseId,
        courseSessionId,
        creatorId,
        question,
        bankId,
        options,
        correctOption,
      );
    if (!instantAssessmentId) {
      res.error();
      return;
    }
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.ASSESSMENT_ACTIVATED,
      {
        question,
        options,
        assessmentType: 'INSTANT',
        assessmentId: instantAssessmentId,
      }
    )
    console.log("mark2")
    res.send({
      instantAssessmentId,
    })
  } catch (e) {
    console.error('[ERROR] InstantAssessment Router create', e);
    res.error();
  }
};

async function deactivate(req, res) {
  const { courseSessionId, correctOption, assessmentId } = req.body
  try {
    const result = await InstantassessmentService
      .deactivate(courseSessionId, correctOption, assessmentId)
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
    console.error('[ERROR] InstantAssessment Router deactivate', e);
    res.error();
  }
};

async function answer(req, res) {
  const {
    courseSessionId,
    userId,
    assessmentId,
    courseId,
    optionIndex,
  } = req.body;
  try {
    const answer = InstantassessmentService
      .answer(
        courseSessionId,
        userId,
        assessmentId,
        courseId,
        optionIndex,
      );
    Socket.send(
      Socket.generatePrivateChannel(courseSessionId),
      Events.INSTANT_ASSESSMENT_ANSWERED,
      {
        userId,
        optionIndex,
      }
    )
    res.success();
  } catch (e) {
    console.error('[ERROR] InstantAssessment Router answer', e);
    res.error();
  }
}

export default router;
