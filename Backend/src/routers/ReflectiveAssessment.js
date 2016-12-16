
import express from 'express';
import mongoose from 'mongoose';
import ReflectiveAssessmentService from '../services/ReflectiveAssessment';
import Socket from '../services/Socket';
import Events from '../services/Events';

const router = express.Router();

router.post('/create', create);
router.post('/deactivate', deactivate);

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

export default router;
