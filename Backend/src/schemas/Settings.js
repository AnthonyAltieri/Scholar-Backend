/**
 * @author Anthony Altieri on 11/5/16.
 */

import mongoose from 'mongoose';
const Id = mongoose.Schema.Types.ObjectId;

const settings = {
  isAskDisabled: Boolean,
  alertThreshold: Number,
  isAlertDisabled: Boolean,
  isResponseDisabled: Boolean,
};

export default settings;