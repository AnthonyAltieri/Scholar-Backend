/**
 * @author Anthony Altieri on 11/19/16.
 */


import express from 'express';
import mongoose from 'mongoose';
import InstructorSettingsService from '../services/InstructorSettings'

const router = express.Router();

router.post('/create', create);
router.post('/save', save);
router.post('/get', get);

async function create(req, res) {
  const {
    userId,
    threshold,
    platformRestrictions,
    hasProfanityFilter,
    hasQuestionList,
    hasAlerts,
  } = req.body;
  try {
    await InstructorSettingsService.create(
      userId,
      threshold,
      platformRestrictions,
      hasProfanityFilter,
      hasQuestionList,
      hasAlerts,
    );
    res.success();
  } catch (e) {
    res.error();
  }
}

async function save(req, res) {
  const {
    userId,
    threshold,
    platformRestrictions,
    hasProfanityFilter,
    hasQuestionList,
    hasAlerts,
  } = req.body;
  try {
    const settings = await InstructorSettingsService.save(
      userId,
      threshold,
      platformRestrictions,
      hasProfanityFilter,
      hasQuestionList,
      hasAlerts,
    );
    res.success();
  } catch (e) {
    res.error();
  }
}

async function get(req, res) {
  const { userId } = req.body;
  try {
    const settings = await InstructorSettingsService.get(userId);
    return InstructorSettingsService.mapToSend(settings);
  } catch (e) {
    res.error();
  }
}

export default router;

