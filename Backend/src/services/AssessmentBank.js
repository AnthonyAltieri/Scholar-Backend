import db from '../db';
import mongoose from 'mongoose';
import AssessmentBankSchema from '../schemas/AssessmentBank';
const AssessmentBank = mongoose.model('assessmentbanks', AssessmentBankSchema);

async function create(userId) {
  try {
    return await db.create({ userId }, AssessmentBank);
  } catch (e) {
    console.error('[ERROR] AssessmentBank Service create', e);
    return null;
  }
};

async function getById(id) {
  try {
    return await db.findById({ id }, AssessmentBank);
  } catch (e) {
    console.error('[ERROR] AssessmentBank Service getById', e);
    return null;
  }
}

async function getBankIdByUserId(userId) {
  try {
    return await db.findOne({ userId }, AssessmentBank);
  } catch (e) {
    console.error('[ERROR] AssessmentBank Service getByUserId', e);
    return null;
  }
}

export default {
  create,
  getById,
  getBankIdByUserId,
};
