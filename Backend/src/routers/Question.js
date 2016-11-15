/**
 * @author Anthony Altieri on 11/12/16.
 */

import QuestionService from '../services/Question';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.post('/create', create);

async function create(req, res) {
  const {
    content,
    userId,
    courseId,
    courseSessionId,
  } = req.body;

  const question = await QuestionService
    .buildQuestion(
      content,
      userId,
      courseId,
      courseSessionId,
    );


}

async function dismiss() {

}

