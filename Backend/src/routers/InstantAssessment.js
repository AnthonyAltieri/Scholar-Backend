import express from 'express';
import mongoose from 'mongoose';
import InstantassessmentService from '../services/InstantAssessment';

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
    // TODO: socket stuff
    res.send({
      instantAssessmentId,
    })
  } catch (e) {
    console.error('[ERROR] InstantAssessment Router create', e);
    res.error();
  }
};

async function deactivate(req, res) {
  const { courseSessionId } = req.body
  try {
    const result = await InstantassessmentService
      .deactivate(courseSessionId)
    if (!result) {
      res.error();
      return;
    }
    // TODO: socket stuff
    res.success();
  } catch (e) {
    console.error('[ERROR] InstantAssessment Router deactivate', e);
    res.error();
  }
};

export default router;
