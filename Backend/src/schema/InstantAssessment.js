/**
 * @author Anthony Altieri on 11/5/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
import Assessment from './Assessment';
const Id = Mongoose.Schema.Types.ObjectId;

const InstantAssessment = new Schema({
  ...Entity,
  ...Assessment,
  options: [Option],
});

