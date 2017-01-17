/**
 * @author Anthony Altieri on 11/18/16.
 */

import mongoose from 'mongoose';
import ReferralCodeSchema from '../schemas/ReferralCode';
import db from '../db';

const ReferralCode = mongoose.model('referralcodes', ReferralCodeSchema);

async function check(code) {
  try {
    const referralCode = await db.findOne({ code }, ReferralCode);
    if (!referralCode) {
      return {
        found: false,
      }
    }
    return {
      referralCode,
      found: true,
    }
  } catch (e) {
    return null;
  }
}

export default {
  check,
}
