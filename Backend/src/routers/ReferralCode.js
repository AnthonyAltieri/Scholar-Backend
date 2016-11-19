/**
 * @author Anthony Altieri on 11/18/16.
 */

import ReferralCodeService from '../services/ReferralCode'
import express from 'express';
const router = express.Router();


router.post('/check', check);


async function check(req, res) {
  const { referralCode } = req.body;
  try {
    const result = await ReferralCodeService.check(referralCode);
    if (!result) {
      res.error();
      return;
    }
    const { found, referralCode } = result;
    if (!found) {
      res.send({});
      return;
    }
    res.send({ referralCode });
  } catch (e) {
    res.error();
  }
}