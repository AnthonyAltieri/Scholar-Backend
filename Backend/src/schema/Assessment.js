/**
 * @author Anthony Altieri on 11/5/16.
 */

const Id = Mongoose.Schema.Types.ObjectId;

const Assessment = {
  courseId: Id,
  courseSessionId: Id,
  creatorId: Id,
  prompt: String,
  bankId: Id,
};

export default Assessment;
