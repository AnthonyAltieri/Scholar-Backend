import express from 'express';
import mongoose from 'mongoose';
import AssessmentBankService from '../services/AssessmentBank';
import BankedAssessmentService from '../services/BankedAssessment';

const router = express.Router();

router.post('/create', create);
router.post('/get/userId', getByUserId);

async function create(req, res) {
  const { userId } = req.body;
  try {
    const assessmentBank = await AssessmentBankService.create(userId);
    res.success();
  } catch (e) {
    console.error('[ERROR] AssessmentBank Router create', e);
    res.error();
  }
}

async function getByUserId(req, res) {
  const { userId } = req.body;
  try {
    let assessmentBank = await AssessmentBankService
      .getBankIdByUserId(userId);
    if (!assessmentBank) {
      assessmentBank = await AssessmentBankService.create(userId);
    }
    res.send({ assessmentBankId: assessmentBank.id });
  } catch (e) {
    console.error('[ERROR] AssessmentBank Router getByUserId', e);
    res.error();
  }
}

export default router;
