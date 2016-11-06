/**
 * @author Anthony Altieri on 11/5/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';

const AssessmentBank = new Schema({
  ...Entity,
  userId: Id,
  courseId: Id,
  name: Id,
  datePlanned: Date,
  isDirty: Boolean,
});

export default AssessmentBank;
