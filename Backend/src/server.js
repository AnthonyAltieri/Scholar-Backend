'use strict';


import SERVER_ENV from './ServerEnv';
import Socket from './services/Socket';


// var express = require('express');
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import mongoose from 'mongoose';
var MongoStore = require('connect-mongo/es5')(session);
import SchoolService from './services/SchoolService'

import IdUtility from './utilities/IdUtility';

Socket.init();

var PORT = null;
switch (SERVER_ENV.ENV) {
  case 'DEVELOPMENT':
    PORT = 8000;
    break;

  case 'PRODUCTION':
    PORT = 80;
    break;
}
const SESSION_SECRET = 'Scholar620';

// Connect to MongoDB and our database
mongoose.connect('mongodb://localhost/Scholar');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database connection is open.');
});

// Initialize the express application
var app = express();

app.use((req, res, next) => {
  res.success = () => {
    res.send({
      success: true
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


if (SERVER_ENV === 'PRODUCTION') {
  app.use( (req, res, next) => {
    console.log(req.url);
    next();
  })
}

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, *');
  next();
});

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

// app.get('/*', function(req, res) {
//
//   if(req.query.course && req.query.code){
//     console.log("got query params to add course");
//     CourseRegistrationUtility.handleInitialRequest(req, res);
//   }
//   if(req.query.talk === "jae-kim"){
//     req.query.course="Playground";
//     req.query.code="57e44ecb0bde70455e0b4821";
//     req.query.instantSignOn="true";
//     CourseRegistrationUtility.handleInitialRequest(req, res);
//   }
//
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

app.get("/pusher/auth", function(req, res) {
  var query = req.query;
  var socketId = query.socket_id;
  var channel = query.channel_name;
  var callback = query.callback;

  var auth = JSON.stringify(Socket.authenticate(socketId, channel));
  var cb = callback.replace(/\"/g,"") + "(" + auth + ");";

  res.set({
    "Content-Type": "application/javascript"
  });

  res.send(cb);
});

app.listen(PORT, async function() {
  console.log('Starting server, listening on port %s', PORT);
});

import UserRouter from './routers/UserRouter';
app.use('/api/user', UserRouter);

import CourseRouter from './routers/CourseRouter';
app.use('/api/course', CourseRouter);

import CourseSettingsRouter from './routers/CourseSettings'
app.use('/api/courseSettings', CourseSettingsRouter);

import InstructorSettingsRouter from './routers/InstructorSettings'
app.use('/api/instructorSettings', InstructorSettingsRouter);

import CourseSessionRouter from './routers/CourseSession'
app.use('/api/courseSession', CourseSessionRouter);

import QuestionRouter from './routers/Question';
app.use('/api/question', QuestionRouter);

import ResponseRouter from './routers/Response'
app.use('/api/response', ResponseRouter);


//Testing for v1.1
// import TestRouter from './routers/TestRouter';
// app.use('/api/test', TestRouter);