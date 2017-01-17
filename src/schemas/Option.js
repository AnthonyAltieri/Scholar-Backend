/**
 * @author Anthony Altieri on 11/5/16.
 */

import mongoose, { Schema } from 'mongoose';

const Option = new Schema({
  _id: false,
  content: String,
});

export default Option;