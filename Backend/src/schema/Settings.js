/**
 * @author Anthony Altieri on 11/5/16.
 */
const Id = Mongoose.Schema.Types.ObjectId;

const settings = {
  isAskDisabled: Boolean,
  alertThreshold: Number,
  isAlertDisabled: Boolean,
  isResponseDisabled: Boolean,
};

export default settings;