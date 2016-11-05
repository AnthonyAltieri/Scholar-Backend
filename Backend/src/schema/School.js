/**
 * @author Anthony Altieri on 11/4/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
const Id = Mongoose.Schema.Types.ObjectId;

const School = new Schema({
  ...Entity,
  name: String,
  termType: String, // ENUM: quarter | semester | trimester
});

export default School;
