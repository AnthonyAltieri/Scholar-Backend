
import express from 'express';
import mongoose from 'mongoose';
import ReflectiveAssessmentService from '../services/ReflectiveAssessment';

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
    // TODO: socket stuff
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
    // TODO: socket stuff
    res.success();
  } catch (e) {
    console.error('[ERROR] ReflectiveAssessment Router deactivate', e);
    res.error();
  }
}

export default router;
