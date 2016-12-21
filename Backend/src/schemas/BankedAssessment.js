import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';

const BankedAssessment = new Schema({
  ...Entity,
  tags: [String],
  question: String,
  options: [String],
  created: Date,
  bankId: String,
  courseId: String,
  userId: String,
  inQueue: Boolean,
  removed: Boolean,
});

export default BankedAssessment;
