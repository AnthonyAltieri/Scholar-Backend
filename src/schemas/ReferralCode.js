/**
 * @author Anthony Altieri on 11/18/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
const Id = mongoose.Schema.Types.ObjectId;

const ReferralCode = new Schema({
  ...Entity,
  code: String,
  type: String, // STUDENT_REP
});

export default ReferralCode;
