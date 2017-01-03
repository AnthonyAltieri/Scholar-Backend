/**
 * Created by bharatbatra on 12/20/16.
 */
import db from '../db';
import mongoose from 'mongoose';
import UserSchema from '../schemas/User';
const User = mongoose.model('users', UserSchema);
// import CourseSchema from '../schemas/Course';
// const Course = mongoose.model('Courses', CourseSchema);
//
import InstantAssessmentService from '../services/InstantAssessment'
import AlertService from '../services/Alert'
import ReflectiveAssessmentService from '../services/ReflectiveAssessment'
import QuestionService from '../services/Question';
import UserService from '../services/UserService';
import CourseSessionService from '../services/CourseSession'
import Socket from '../services/Socket'
import Events from '../services/Events'

const HELP_TEXT_1 = "Usage  \n"
  +"———————— \n"
  +"[Attendance] text this: \n"
  +"code : (Code) \n"

  +"where (Code) is the attendance code your professor gives you \n"
  + "Example: code : ABCD \n"
  +"———————— \n"
  +"[Alert] text this: \n"
  +"! \n";

const HELP_TEXT_2 = HELP_TEXT_1
  +"———————— \n"
  +"[Ask a question] text this:\n"
  +"q: (your question) \n"

  +"notice the space in between the : and your question \n"
  +"Example - q : what is life? \n"
  +"———————— \n"
  + "[Answer instant assessment] text this: \n "
  + "answer: (option) \n"
  + "Example - answer : a \n"
  +"———————— \n"
  + "[Answer reflective assessment] text this: \n "
  + "answer: (content) \n";


//Converts the text message String into a serialized JSON object
function parseMessage(content) {
  let returnObj = {};

  try {
    console.log(content);
    let parts = content.split('&');
    console.log(JSON.stringify(parts));
    parts.forEach( part => {
      let segments = part.split(":");
      // console.log(segments[0] + " : " + segments[1]);
      returnObj[segments[0].trim().toLowerCase()] = (!!segments[1]) ? segments[1].trim() : "filler";
    });
    return returnObj;
  }
  catch(e) {
   console.error("[ERROR] TextMessageService > parseMessage : " + e);
  }
}

function parsePhone(phone) {
  console.log("Parsing Phone : " + phone);
  return phone.substring(phone.indexOf("+1") + 2);
}

/*
inputs: serialized object generated from the text message input , phone number of sender
output: text message response
 */
async function generateResponse(serialized, phone) {
  let objToSend = {};
  try {

    console.log("Generate Response");

    objToSend.content = "";

    let user = await UserService.findByPhone(phone);
    console.log(JSON.stringify(user, null, 2));

    let courseId = user.textBoundCourse;
    let courseSessionId = user.textBoundSession;

    if (!!serialized.email && !!serialized.password && !user) {
      console.log("Gonna try to login");
      const { user } = await UserService.attemptLogin(serialized.email, serialized.password);
      if(!!user.error) {
        console.log("Error - couldn't log in");
        console.log(user.error);
        objToSend.content += "ERROR : " + user.error;
      }
      else {
        objToSend.content += "Success! Logged In";
        console.log("Success : logged in");
      }
      console.log(JSON.stringify(user, null, 2)) ;
    }

    if (!!serialized.code && !!user) {
      let courseSession = await CourseSessionService.findByAttendanceCode(serialized.code);
      if(!!courseSession){
        const payload = await CourseSessionService.studentJoinAttendance(courseSession.id, serialized.code, user.id);
        if(!!payload.attendance) {
          courseId = courseSession.courseId;
          courseSessionId = courseSession.id;
          user.textBoundSession = courseSessionId;
          user.textBoundCourse = courseId;
          db.save(user);
          Socket.send(
            Socket.generatePrivateChannel(courseSessionId),
            Events.STUDENT_JOINED_ATTENDANCE,
            { attendance: payload.attendance }
          );
          objToSend.content += "Success! Joined Attendance";
        }
        else {
          objToSend.content += JSON.stringify(payload) + "\n";
        }
      }
    }

    if(!!serialized.answer && !!courseSessionId && !!courseId) {
      let courseSession = await CourseSessionService.getById(courseSessionId);

      if(!!courseSession.activeAssessmentId) {

        if(courseSession.activeAssessmentType === "INSTANT") {
          let optionIndex = -1;

          switch (serialized.answer.toLowerCase().trim()) {
            case "a" : optionIndex = 0; break;
            case "b" : optionIndex = 1; break;
            case "c" : optionIndex = 2; break;
            case "d" : optionIndex = 3; break;
            case "e" : optionIndex = 4; break;
            default : optionIndex = -1;
          }

          if(optionIndex !== -1) {
            try {
              const answer = InstantAssessmentService
                .answer(
                  courseSessionId,
                  user.id,
                  courseSession.activeAssessmentId,
                  courseId,
                  optionIndex,
                );
              Socket.send(
                Socket.generatePrivateChannel(courseSessionId),
                Events.INSTANT_ASSESSMENT_ANSWERED,
                {
                  userId : user.id,
                  optionIndex
                }
              );
              objToSend.content += "Success! Answered instant Assessment";
            } catch (e) {
              console.error('[ERROR] TextMessage Service > InstantAssessment answer', e);
              objToSend.content += "Error! Couldn't Answer : " + e;
            }
          }
          else{
            objToSend.content += "Error : Invalid option";
          }
        }
        else {
          try {
            const answer = await ReflectiveAssessmentService
              .answer(
                courseSessionId,
                user.id,
                courseSession.activeAssessmentId,
                courseId,
                serialized.answer,
              );

            if (!answer) {
              console.error('[ERROR] TextMessage Service > ReflectiveAssessment null answer');
              objToSend.content += "Error! Could not answer ";
            }
            else {
              Socket.send(
                Socket.generatePrivateChannel(courseSessionId),
                Events.REFLECTIVE_ASSESSMENT_ANSWERED,
                {}
              );
              objToSend.content += "Success! Answered Reflective Assessment";
            }
          }
          catch (e) {
            console.error('[ERROR] TextMessage Service > ReflectiveAssessment  answer', e);
            objToSend.content += "Error! Could not answer " + e;
          }
        }
      }
      else {
        objToSend.content += "Error! No Active Assessment Found";
      }

    }

    if(!!serialized["!"] && !!courseSessionId && !!courseId) {
      try {
        const alertWindow = 60;//TODO: find this using course Settings
        const alert = await AlertService.attemptAddAlert(user.id, courseId, courseSessionId, alertWindow );

        if (!!alert) {
          objToSend.content += "Successfully added your alert."
        }
        else {
          objToSend.content += "Unknown Error. Please try again ";
        }
      }
      catch (e) {
        console.error("[ERROR] TextMessageService > alert " + e);
        objToSend.content += "Error : " + e;
      }
    }

    //In case the short form has been used for question,
    if(!!serialized.q && !serialized.question) {
      serialized.question = serialized.q;
    }

    if(!!serialized.question && !!courseSessionId && !!courseId) {
      let question = await QuestionService
        .build(
          serialized.question,
          user.id,
          courseId,
          courseSessionId,
        );
        if (!!question) {
          Socket.send(
            Socket.generatePrivateChannel(courseSessionId),
            Events.QUESTION_ASKED,
            {
              question: QuestionService.mapToSend(question),
            }
          );
          objToSend.content += "Question Added Successfully!\n";
        }
    }
    return objToSend;

  } catch (error) {
    console.error("[ERROR] TestMessage Service > generateResponse : " + error);
    return objToSend;
  }
}

export default{
  parseMessage,
  HELP_TEXT_2,
  generateResponse,
  parsePhone
}
