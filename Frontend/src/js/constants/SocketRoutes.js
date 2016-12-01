/** Author: Anthony Altieri **/

(() => {
    angular
        .module('app')
        .factory('SocketRoutes', SocketRoutes);
    
    function SocketRoutes() {
        return {
            BASE_URL: 'http://localhost:8000',


            ADD_QUESTION: 'ADD_QUESTION',
            ADDED_QUESTION: 'ADDED_QUESTION',

            RETRIEVED_QUESTIONS: 'RETRIEVED_QUESTIONS',

            REFLECTIVE_ASSESSMENT_START: 'REFLECTIVE_ASSESSMENT_START',
            REFLECTIVE_ASSESSMENT_STARTED: 'REFLECTIVE_ASSESSMENT_STARTED',
            REFLECTIVE_ASSESSMENT_STOP: 'REFLECTIVE_ASSESSMENT_STOP',
            
            REFLECTIVE_ASSESSMENT_RESPONSE: 'REFLECTIVE_ASSESSMENT_RESPONSE',
            REFLECTIVE_ASSESSMENT_RESPONSE_RECEIVED: 'REFLECTIVE_ASSESSMENT_RESPONSE_RECEIVED',
            RA_RESPONSE_RECEIVED: 'REFLECTIVE_ASSESSMENT_RESPONSE',
            RA_RESPONSE_NUMBER: 'RA_RESPONSE_NUMBER',
            RA_RESPONSE_REVIEWED: 'RA_RESPONSE_REVIEWED',

            INSTANT_ASSESSMENT_START: 'INSTANT_ASSESSMENT_START',
            INSTANT_ASSESSMENT_STARTED: 'INSTANT_ASSESSMENT_STARTED',
            
            MC_SELECTION_MADE: 'MC_SELECTION_MADE',
            MC_STOP: 'MC_STOP',

            STUDENT_JOINED: 'STUDENT_JOINED',
            STUDENT_LEFT: 'STUDENT_LEFT',
            
            JOIN_COURSESESSION: 'JOIN_COURSESESSION',
            
            COURSE_SESSION_END: 'COURSE_SESSION_END',
            
            CONFUSION_UPDATED: 'CONFUSION_UPDATED',

            ALERT_ADDED: 'ALERT_ADDED',

            QUESTIONS_UPDATE: 'QUESTIONS_UPDATE',
            QUESTION_VOTE: 'QUESTION_VOTE',
            QUESTION_ADDED: 'QUESTION_ADDED',
            QUESTION_REMOVED: 'QUESTION_REMOVED',


            VOTED_ON_QUESTION: 'VOTED_ON_QUESTION',
            
            QUESTION_DELETED: 'QUESTION_DELETED',

        }
    }
})();