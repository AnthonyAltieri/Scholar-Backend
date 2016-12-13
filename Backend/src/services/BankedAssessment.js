import db from '../db';
import mongoose from 'mongoose';
import AssessmentBankService from '../services/AssessmentBank';
import BankedAssessmentSchema from '../schemas/BankedAssessment';
const BankedAssessment = mongoose.model('bankedassessments', BankedAssessmentSchema);

async function create(
  question,
  options,
  tags,
  created,
  courseId,
  bankId,
  userId,
) {
  try {
    return await db.create({
      question,
      options,
      tags,
      created,
      courseId,
      bankId,
      userId,
    }, BankedAssessment);
  } catch (e) {
    console.error('[ERROR] BankedAssessment Service create', e);
    return null;
  }
}

async function getAllInBank(bankId) {
  try {
    return await db.find({ bankId }, BankedAssessment);
  } catch (e) {
    console.error('[ERROR] BankedAssessment Service getAllInBank', e);
    return null;
  }
}

function mapToSend(bankedAssessment) {
  return {
    id: bankedAssessment.id,
    tags: bankedAssessment.tags,
    question: bankedAssessment.question,
    options: bankedAssessment.options,
    created: bankedAssessment.created,
    courseId: bankedAssessment.courseId,
  }
}

async function saveEdit(
  bankedAssessmentId,
  questionEdit,
  optionsEdit,
) {
  try {
    const bankedAssessment = await getById(bankedAssessmentId);
    // Determine if there has been an question edit
    if (typeof questionEdit !== 'undefined') {
      bankedAssessment.question = questionEdit;
    }
    // Determine if there has been an options edit
    if (typeof optionsEdit !== 'undefined'
        && optionsEdit.filter(o => !!o).length > 0) {
          bankedAssessment.options = optionsEdit
            .reduce((a, c, i) => (!!c
              ? [...a, c]
              : [...a, bankedAssessment.options[i]]
            ), [])
    }
    return await db.save(bankedAssessment);
  } catch (e) {
    console.error('[ERROR] Banked Assessment Service saveEdit', e);
    return null;
  }
}

async function findById(id) {
  try {
    return await db.findById(id, BankedAssessment);

  } catch (e) {
    console.error('[ERROR] BankedAssessment Service findById', e);
    return null;
  }
}

async function clearOption(index, bankedAssessmentId) {
  try {
    const bankedAssessment = await findById(bankedAssessmentId);
    bankedAssessment.options = [
      ...bankedAssessment.options.slice(0, index),
      ...bankedAssessment.options.slice(index + 1),
    ];
    return await db.save(bankedAssessment, BankedAssessment);
  } catch (e) {
    console.error('[ERROR] BankedAssessment Service clearEdit', e);
    return null;
  }
}

async function getById(id) {
  try {
    return await db.findById(id, BankedAssessment);
  } catch (e) {
    console.error('[ERROR] BankedAsessment Service getById', e);
    return null;
  }
}

async function editTags(id, tags) {
  try {
    const bankedAssessment = await findById(id);
    if (!bankedAssessment) return null;
    bankedAssessment.tags = tags;
    return await db.save(bankedAssessment);
  } catch (e) {
    console.error('[ERROR] BankedAssessment Service editTags', e);
    return null;
  }
}

async function remove(id) {
  try {
    const bankedAssessment = await findById(id);
    bankedAssessment.bankId = null;
    return await db.save(bankedAssessment);
  } catch (e) {
    console.error('[ERROR] BankedAssessment Service remove', e);
    return null;
  }
}


export default {
  create,
  getAllInBank,
  mapToSend,
  saveEdit,
  findById,
  clearOption,
  getById,
  editTags,
  remove,
};
