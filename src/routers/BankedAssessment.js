import express from 'express';
import mongoose from 'mongoose';
import BankedAssessmentService from '../services/BankedAssessment';

const router = express.Router();

router.post('/create', create);
router.post('/edit/id', editById);
router.post('/edit/tags/id', editTagsById);
router.post('/get/bankId', getByBankId);
router.post('/clear/option', clearOption);
router.post('/remove/id', removeById);
router.post('/moveTo/bank', moveToBank);
router.post('/moveTo/queue', moveToQueue);

async function create(req, res) {
  const {
    userId,
    bankId,
    question,
    options,
    tags,
    courseId,
    created
  } = req.body;
  try {
    const bankedAssessment = await BankedAssessmentService
      .create(question, options, tags, created, courseId, bankId, userId)
    if (!bankedAssessment) {
      res.error();
      return;
    }
    res.send({ bankedAssessmentId: bankedAssessment.id });
  } catch (e) {
    console.error('[ERROR] BankedAssessment Router create', e);
    res.error();
  }
}

async function editById(req, res) {
  const {
    bankedAssessmentId,
    questionEdit,
    optionsEdit,
  } = req.body;
  try {
    const bankedAssessment = await BankedAssessmentService
    .saveEdit(
      bankedAssessmentId,
      questionEdit,
      optionsEdit,
    );
    res.send({
      question: bankedAssessment.question,
      options: bankedAssessment.options,
    })
  } catch (e) {
    console.error('[ERROR] BankedAssessment Router editById', e);
    res.error();
  }
}

async function editTagsById(req, res) {
  const {
    bankedAssessmentId,
    tags,
  } = req.body;
  try {
    const bankedAssessment = await BankedAssessmentService
      .editTags(bankedAssessmentId, tags);
    if (!bankedAssessment) {
      res.error();
      return;
    }
    res.send({
      tags: bankedAssessment.tags,
    });
  } catch (e) {
    console.error('[ERROR] BankedAssessment Router editTagsById', e);
  }
}

export async function getByBankId(req, res) {
  const { bankId } = req.body;
  try {
    const assessments = await BankedAssessmentService.getAllInBank(bankId);
    res.send({
      bankedAssessments: assessments.map(BankedAssessmentService.mapToSend),
    })
  } catch (e) {
    console.error('[ERROR] BankedAssessment Router getAssessmentsByBankId', e);
    res.error();
  }
}

export async function clearOption(req, res) {
  const { index, bankedAssessmentId } = req.body;
  try {
    const bankedAssessment = await BankedAssessmentService
      .clearOption(index, bankedAssessmentId);
    res.success();
  } catch (e) {
    console.error('[ERROR] BankedAssessment Router clearOption', e);
    res.error();
  }
}

export async function removeById(req, res) {
  const { bankedAssessmentId } = req.body;
  try {
    const bankedAssessment = await BankedAssessmentService
      .remove(bankedAssessmentId);
    res.success();
  } catch (e) {
    console.error('[ERROR] BankedAssessment Router removeById', e);
    res.error();
  }
}

export async function moveToBank(req, res) {
  const { id } = req.body;
  try {
    const bankedAssessment = await BankedAssessmentService
      .moveToBank(id);
    res.success();
  } catch (e) {
    console.error('[ERROR] BankedAssessment Router moveToBank', e);
    res.error();
  }
}

export async function moveToQueue(req, res) {
  const { id } = req.body;
  try {
    const bankedAssessment = await BankedAssessmentService
      .moveToQueue(id);
    res.success();
  } catch (e) {
    console.error('[ERROR] BankedAssessment Router moveToQueue', e);
    res.error();
  }
}

export default router;
