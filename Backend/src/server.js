'use strict';


import SERVER_ENV from './ServerEnv';

var PORT = null;
switch (SERVER_ENV.ENV) {
  case 'DEVELOPMENT':
    PORT = 8000;
    break;
  
  case 'PRODUCTION':
    PORT = 80;
    break;
}
var SESSION_SECRET = 'Scholar620';

// var express = require('express');
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import mongoose from 'mongoose';
var MongoStore = require('connect-mongo/es5')(session);
import SchoolService from './services/SchoolService'

// Import Utilities
import IdUtility from './utilities/IdUtility';
//import CourseRegistrationUtility from './utilities/CourseRegistrationUtility';

// Connect to MongoDB and our database
mongoose.connect('mongodb://localhost/Scholar');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database connection is open.');
});

// Initialize the express application
var app = express();

// Create Server Error middleware
app.use((req, res, next) => {
  res.sendServerError = (error) => {
    console.error('ERROR: ', error);
    res.send({
      error: `Server error`,
      success: false,
      code: 500
    })
  };

  res.error = (error) => {
    console.error('ERROR: ', error);
    res.send({
      error: 'Server Error',
    })
  };
  next();
});

// Create Server Success middleware
app.use( (req, res, next) => {
  res.success = () => {
    res.send({
      success: true
    })
  };
  next();
});

if (SERVER_ENV === 'PRODUCTION') {
  app.use( (req, res, next) => {
    console.log(req.url);
    next();
  })
}

// Set up SocketIO
var server = require('http').Server(app);
var io = require('socket.io')(server);

// For CORS, not used right now

// if (SERVER_ENV.ENV === 'PRODUCTION') {
  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, *');
    next();
  });
// }

// Set up the application's body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


var store = new MongoStore({ mongooseConnection: mongoose.connection });

app.use(session({
  genid: req => {
    return (IdUtility.generateUId());
  },
  secret: SESSION_SECRET,
  store: store
}));

app.use('/static', express.static(path.join(__dirname, 'public')));
console.log(path.join(__dirname, 'public'));

app.post('/schools', async function(req, res){
  res.send((await SchoolService.findAll()).map(s => s.name));
});

app.get('/*', function(req, res) {

  if(req.query.course && req.query.code){
    console.log("got query params to add course");
    CourseRegistrationUtility.handleInitialRequest(req, res);
  }
  if(req.query.talk === "jae-kim"){
    req.query.course="Playground";
    req.query.code="57e44ecb0bde70455e0b4821";
    req.query.instantSignOn="true";
    CourseRegistrationUtility.handleInitialRequest(req, res);
  }

  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/pusher/auth', (req, res) => {
  const { socketId, channel } = req.body;
  const auth = pusher.authenticate(socketId, channel);
  res.send(auth);
});


// Services
// var QuestionService = require('./../dist/services/QuestionService');
// var questionService = new QuestionService();
// var InstantAssessmentService = require('./../dist/services/InstantAssessmentService');
// var instantAssessmentService = new InstantAssessmentService();
// import CourseSessionService from './../dist/services/CourseSessionService';

server.listen(PORT, async function() {
  console.log('Starting server, listening on port %s', PORT);
});

// Sockets
let allSockets = 0;
// import SocketRouter from '../dist/routers/SocketRouter';
// const socketRouter = new SocketRouter();
// io.on('connection', socket => { allSockets += 1; console.log(`Socket Connection Established, ${allSockets} currently connected`); socket.on(socketRouter.DISCONNECT, function() {
//     allSockets -= 1;
//     console.log(`Socket Disconnect, ${allSockets} currently connected`);
//   });
// });

// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });




// Routers

import UserRouter from './routers/UserRouter';
app.use('/api/user', UserRouter);

import CourseRouter from './routers/CourseRouter';
app.use('/api/course', CourseRouter);

import CourseSettingsRouter from './routers/CourseSettings'
app.use('/api/courseSettings', CourseSettingsRouter);

import CourseSessionRouter from './routers/CourseSession';
app.use('/api/courseSession', CourseSessionRouter);
//
// import InstantAssessmentRouter from './routers/InstantAssessmentRouter';
// app.use('/api/instantAssessment', InstantAssessmentRouter);
//
// import ReflectiveAssessmentRouter from './routers/ReflectiveAssessmentRouter';
// app.use('/api/reflectiveAssessment', ReflectiveAssessmentRouter);
//
//
// import AdminRouter from './routers/AdminRouter';
// app.use('/api/admin', AdminRouter);

//Testing for v1.1
// import TestRouter from './routers/TestRouter';
// app.use('/api/test', TestRouter);