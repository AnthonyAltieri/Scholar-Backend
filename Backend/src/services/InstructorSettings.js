/**
 * @author Anthony Altieri on 11/19/16.
 */


import mongoose from 'mongoose';
import InstructorSettingsSchema from '../schemas/InstructorSettings';
const InstructorSettings = mongoose.model('instructorsettings', InstructorSettingsSchema);
import db from '../db';

async function create(
  userId,
  threshold,
  platformRestrictions,
  hasProfanityFilter,
  hasQuestionList,
  hasAlerts,
) {
  try {
    return await db.create({
      userId,
      threshold,
      platformRestrictions,
      hasProfanityFilter,
      hasQuestionList,
      hasAlerts,
    }, InstructorSettings);
  } catch (e) {
    return null;
  }
}

async function save(
  userId,
  threshold,
  platformRestrictions,
  hasProfanityFilter,
  hasQuestionList,
  hasAlerts,
) {
  try {
    let settings = await db.findOne({ userId }, InstructorSettings);
    settings = {
      ...settings,
      threshold,
      platformRestrictions,
      hasProfanityFilter,
      hasQuestionList,
      hasAlerts,
    };
    return await db.save(settings);
  } catch (e) {
    return null;
  }
}

async function get(userId) {
  try {
    return await db.findOne({ username }, InstructorSettings);
  } catch (e) {
    return null;
  }
}

function mapToSend(settings) {
  return {
    threshold: settings.threshold,
    platformRestrictions: settings.platformRestrictions,
    hasProfanityFilter: settings.hasProfanityFilter,
    hasQuestionList: settings.hasQuestionList,
    hasAlerts: settings.hasAlerts,
  }
}

export default {
  create,
  save,
  get,
  mapToSend,
}
