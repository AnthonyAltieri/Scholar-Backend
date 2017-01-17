/**
 * @author Anthony Altieri on 11/4/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';

const School = new Schema({
  ...Entity,
  name: {type : String, unique: true  },
  termType: String, // ENUM: quarter | semester | trimester
  timezoneName: String,
});

export default School;
