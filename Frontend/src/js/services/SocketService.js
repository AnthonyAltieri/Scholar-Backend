/** Author: Anthony Altieri **/

(() => {
    angular
        .module('app')
        .factory('SocketService', SocketService);

    SocketService.$inject = ['SocketRoutes', '$rootScope'];

    function SocketService(SocketRoutes, $rootScope) {
      let self = this;

      var socket = $rootScope.socket; 

      self.joinCourseSession = joinCourseSession;


      // Student Question List
      self.handleQuestionAdded = handleQuestionAdded;
      self.handleQuestionDismissed = handleQuestionDismissed;
      self.handleQuestionVote = handleQuestionVote;

      // Student Join/Leave
      self.handleStudentJoinedCourseSession = handleStudentJoinedCourseSession;
      self.handleStudentLeaveCourseSession = handleStudentLeaveCourseSession;

      // Alerts
      self.handleAlertAdded = handleAlertAdded;

      // CourseSession
      self.handleCourseSessionEnd = handleCourseSessionEnd;

      self.handleReflectiveAssessmentCreated = handleReflectiveAssessmentCreated;
      self.handleReflectiveAssessmentResponseStudent = handleReflectiveAssessmentResponseStudent;
      self.handleReflectiveAssessmentResponseInstructor = handleReflectiveAssessmentResponseInstructor;
      self.handleReflectiveAssessmentResponseReviewed = handleReflectiveAssessmentResponseReviewed;
      self.handleReflectiveAssessmentStop = handleReflectiveAssessmentStop;


      self.handleInstantAssessmentStart = handleInstantAssessmentStart;
      self.handleInstantAssessmentStop = handleInstantAssessmentStop;

      self.handleMCSelectionMade = handleMCSelectionMade;

      

        /**
         * Joins a CourseSession
         * @param courseId - The Course that is being joined
         * @param userId - The user that is joining the CourseSession
         */
        function joinCourseSession(courseId, courseSessionId, userId) {
            let date = new Date();
            let data = {
                userId,
                courseSessionId,
                courseId,
                date
            };
            socket.emit(`${SocketRoutes.JOIN_COURSESESSION}`, data);
        }

      /**
       * When the server emits that there has been a question added, there will
       * be a broadcast with the updated question list to the client through
       * $rootScope
       *
       * @param courseSessionId - The id of the Course Session that has had a
       * question asked to it
       */
      function handleQuestionAdded(courseSessionId) {
        const on = `${SocketRoutes.QUESTION_ADDED}:${courseSessionId}`;
        const broadcast = `${SocketRoutes.QUESTION_ADDED}`;
        socket.on(on, data => {
          $rootScope.$broadcast(broadcast, { questions: data.questions })
        });
      }

      /**
       * When the server emits that there has been a question that has been voted on,
       * there will be a broadcast with the updated question list to the client through
       * $rootScope
       *
       * @param courseSessionId - The id of the Course Session that has had a question
       * voted on it
       */
      function handleQuestionVote(courseSessionId) {
        const on = `${SocketRoutes.VOTED_ON_QUESTION}:${courseSessionId}`;
        const broadcast = 'QUESTION_VOTE';
        socket.on(on, data => {
          $rootScope.$broadcast(broadcast, data);
        })
      }

      function handleQuestionDismissed(courseSessionId) {
        const on = `${SocketRoutes.QUESTION_DISMISSED}:${courseSessionId}`;
        const broadcast = 'QUESTION_DISMISSED';
        socket.on(on, data => {
          const { questions } = data;
          $rootScope.$broadcast(broadcast, { questions })
        })
      }


      function handleAlertAdded(courseSessionId) {
        const on = `${SocketRoutes.ALERT_ADDED}:${courseSessionId}`;
        const broadcast = 'ALERT_ADDED';
        socket.on(on, data => {
          $rootScope.$broadcast(broadcast, data);
        })
      }

      function handleStudentJoinedCourseSession(courseSessionId) {
        let route = `${SocketRoutes.STUDENT_JOINED}:${courseSessionId}`;
        socket.on(route, data => { 
          $rootScope.$broadcast('STUDENT_JOINED', { attendance: data.attendance })
        });
      }
      
      function handleStudentLeaveCourseSession(courseSessionId) {
        const route = `${SocketRoutes.STUDENT_LEFT}:${courseSessionId}`;
        socket.on(route, data => {
          $rootScope.$broadcast(route, {attendance: data.attendance});
        });
      }
      
      
      function handleQuestionDeleted(courseSessionId) {
        let routeOn = `${SocketRoutes.QUESTION_DELETED}:${courseSessionId}`;
        let routeEmit = `${SocketRoutes.QUESTION_DELETED}:${courseSessionId}`;
        socket.on(routeOn, data => {
          $rootScope.$broadcast(routeEmit, { 
            questions: data.questions,
            dismissedQuestionId: data.dismissedQuestionId
          })
        });
      }


      function handleReflectiveAssessmentCreated(courseSessionId) {
        let routeOn = `${SocketRoutes.REFLECTIVE_ASSESSMENT_START}:${courseSessionId}`;
        let routeBroadcast = `${SocketRoutes.REFLECTIVE_ASSESSMENT_STARTED}:${courseSessionId}`;

        socket.on(routeOn, data => { 
          $rootScope.$broadcast(routeBroadcast, data)
        });
      }

      function handleReflectiveAssessmentResponseStudent(courseSessionId) {
        const on = `${SocketRoutes.REFLECTIVE_ASSESSMENT_RESPONSE}:${courseSessionId}`;
        socket.on(on, (data) => {
          $rootScope.$broadcast('RA_RESPONSE_RECEIVED', data);
        });
      }

      function handleReflectiveAssessmentResponseInstructor(courseSessionId) {
        const on = `${SocketRoutes.RA_RESPONSE_NUMBER}:${courseSessionId}`;
        socket.on(on, (data) => {
          $rootScope.$broadcast('RA_RESPONSE_NUMBER', data);
        })
      }
      
      function handleReflectiveAssessmentStop(courseSessionId) {
        const route = `${SocketRoutes.REFLECTIVE_ASSESSMENT_STOP}:${courseSessionId}`;
        socket.on(route, data => { $rootScope.$broadcast(route, data) });
      }
      
      function handleInstantAssessmentStart(courseSessionId) {
        const routeOn = `${SocketRoutes.INSTANT_ASSESSMENT_START}:${courseSessionId}`;
        const routeBroadcast = `${SocketRoutes.INSTANT_ASSESSMENT_STARTED}:${courseSessionId}`;
        
        socket.on(routeOn, data => { 
          $rootScope.$broadcast(routeBroadcast, data)
        });
      }
      
      function handleInstantAssessmentStop(courseSessionId) {
        const route = `${SocketRoutes.MC_STOP}:${courseSessionId}`;
        socket.on(route, data => { $rootScope.$broadcast(route, data) });
      }

      function handleMCSelectionMade(courseSessionId) {
        const on = `${SocketRoutes.MC_SELECTION_MADE}:${courseSessionId}`;
        socket.on(on, data => { $rootScope.$broadcast('INSTANT_ASSESSMENT_SELECTION', data) });
      }

      function handleReflectiveAssessmentResponseReviewed(courseSessionId) {
        const route = `${SocketRoutes.RA_RESPONSE_REVIEWED}:${courseSessionId}`;
        socket.on(route, data => { $rootScope.$broadcast('RA_RESPONSE_REVIEWED', data) });
      }
      
      function handleCourseSessionEnd(courseSessionId) {
        const route = `${SocketRoutes.COURSE_SESSION_END}:${courseSessionId}`;
        socket.on(route, data => {
          $rootScope.$broadcast('COURSE_SESSION_END', data)
        });
      }


        return self;
    }
})();