/**
 * @author Anthony Altieri on 11/5/16.
 */
/**
 * @author Anthony Altieri on 11/4/16.
 */

import mongoose, { Schema } from 'mongoose';
import Entity from './Entity';
const Id = String;

const Alert = new Schema({
  ...Entity,
  userId: Id,
  courseId: Id,
  courseSessionId: Id,
});

export default Alert;
