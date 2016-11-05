'use strict';

import mongoose from 'mongoose';
import SessionSchema from '../schemas/Session';

var Session = mongoose.model('sessions', SessionSchema);


class SessionService {
  constructor() {};
  
  static checkIfValidSession(req, res) {
    if (!req.session || req.session.loggedIn) {
      res.send({
        msg: 'Invalid session, returning to the Log In screen',
        success: false
      });
      res.end();
    }
  }

  static getById(id, callback) {
    Session.findById(id, (err, session) => {
      if (err) {
        console.error(`Error finding session by ID: ${err}`);
        return null;
      }
      callback(session);
    });
  }

}

module.exports = SessionService;