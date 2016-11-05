/** Author: Anthony Altieri **/

(() => {
  'use strict';

  angular
    .module('app')
    .controller('DashStudentController', DashStudentController);

  DashStudentController.$inject = [
    '$rootScope', '$scope', '$state', '$stateParams', 'SocketService', 'ServerService',
    'SocketRoutes', 'VoteType', 'ReflectiveAssessmentRoutes', 'CourseSessionRoutes',
    'InstantAssessmentService', 'CourseSessionService', '$timeout', 'UserService', '$interval',
      'QuestionListService'
  ];

  function DashStudentController
  (
    $rootScope, $scope, $state, $stateParams, SocketService, ServerService,
    SocketRoutes, VoteType, ReflectiveAssessmentRoutes, CourseSessionRoutes,
    InstantAssessmentService, CourseSessionService, $timeout, UserService, $interval, QuestionListService
  ) {
    const vm = this;
    vm.questionList = {};

    determineIfHasValidSession($stateParams);
    initCourseSession($stateParams);
    initUIFlags(vm);
    initInput(vm);

    let intervals = [];

    $scope.$on('QUESTION_LIST_INIT', (event, data) => {
      UserService.getId()
        .then((data) => {
          const { userId } = data;
          $scope.$broadcast('INIT_QUESTION_LIST', {
            userId,
            courseSessionId: vm.courseSession.id
          });
          vm.userId = userId;
        });
    });

    $scope.$on('QUESTION_LIST_AVAILABLE', (event, data) => {
      vm.questionList = data;
    });


    receivePriorSelections(vm.courseSession.id);

    vm.mode = 'QUESTIONS';


    // Util
    vm.isUser = isUser;

    // Confusion \\
    vm.submitConfusion = submitConfusion;
    vm.acknowledgeConfusionSubmit = acknowledgeConfusionSubmit;

    // Questions \\
    vm.beginQuestionInputMode = beginQuestionInputMode;
    vm.submitQuestion = submitQuestion;
    vm.sendQuestionToServer = sendQuestionToServer;
    vm.upVoteQuestion = upVoteQuestion;
    vm.downVoteQuestion = downVoteQuestion;
    vm.backToQuestions = backToQuestions;
    
    // Free Response (Peer Review)
    vm.submitReflectiveAssessmentResponse = submitReflectiveAssessmentResponse;
    vm.filterResponses = filterResponses;
    vm.voteOnResponse = voteOnResponse;
    vm.dismissResponse = dismissResponse;

    // Sticky \\
    vm.answerSticky = answerSticky;
    vm.determineStickyContent = determineStickyContent;

    // CourseSession End
    vm.acknowledgeClassIsOver = acknowledgeClassIsOver;

    
    vm.timeFromNow = timeFromNow;
    vm.clickBack = clickBack;

    // Instant Assessment \\
    vm.clickOption = clickOption; 

    //Connection Status
    vm.connectionStatus = "connected";

    $rootScope.priorCourseSessionId = vm.courseSessionId;

    // Sockets \\
    handleSockets(SocketService, vm.courseSession.id);

    $rootScope.loading = false;

    /**
     * Initializes all of the socket handlers for the various socket events that are necessary
     * for the student
     *
     * @param SocketService {object} - The SocketService that is injected into the controller
     * @param courseSessionId {string} - The id associated with this Course Session
     */
    function handleSockets(SocketService, courseSessionId) {
      SocketService.handleReflectiveAssessmentCreated(courseSessionId);
      SocketService.handleReflectiveAssessmentResponseStudent(courseSessionId);
      SocketService.handleReflectiveAssessmentStop(courseSessionId);
      SocketService.handleInstantAssessmentStart(courseSessionId);
      SocketService.handleInstantAssessmentStop(courseSessionId);
      SocketService.handleCourseSessionEnd(courseSessionId);
    }


    function isUser(userId) {
      return vm.userId.toString() === userId.toString();
    }
    
    /**
     * Changes the UI based on what the back text is, in a Quiz mode it navigates the user back
     * to questions, on the dashboard it takes the user back to their Courses
     */
    function clickBack() {
      switch (vm.backText) {
        case 'Questions':
          backToQuestions();
          break;
        
        case 'Courses':
          goToDashClasses();
          break;
      }
    }

    /**
     * Sets the UI flags to hide the sticky
     */
    function stopReflectiveAssessment() {
      vm.showSticky = false;
      vm.sticky = {};
      vm.backText = 'Courses';
      vm.mode = 'QUESTIONS';
      $rootScope.dismissedResponses = undefined;
      $state.go('dash.student');
    }
    
    function stopInstantAssessment() {
      vm.showSticky = false;
      vm.sticky = {};
      vm.backText = 'Courses';
      vm.mode = 'QUESTIONS';
    }


    /**
     * Navigates the user back to the Question forum and out of the Question asking mode, Reflective
     * assessment mode, and Instant assessment mode.
     */
    function backToQuestions() {
      vm.mode = 'QUESTIONS';
      vm.modeAskQuestion = false;
      vm.backText = 'Courses';
    }


    /**
     * Logs the user out of a Course Session and navigates the UI back to the state Dash Classes
     */
    function goToDashClasses() {
      ServerService.post(CourseSessionRoutes.LEAVE, {
        courseSessionId: vm.courseSession.id
        },
        resSuccess => {
          const { data } = resSuccess;
          const { success } = data;

          if (success) {
            toastr.info('Leaving Course Session and going to your course list');
            $rootScope.votedOn = vm.votedOn;
            $rootScope.lastCourse = vm.courseSession.classCode;
            $rootScope.priorCourseSessionId = vm.courseSession.id;

            $state.go('dash.courses.active');
            
          }
        },
        resFail => {}
      );
      
    }
    

    function timeFromNow(dateString) {
      return moment(dateString).fromNow()
    }


    /**
     * Changes the UI to put the user into the mode in order to respond to the sticky
     */
    function answerSticky() {
      switch (vm.sticky.type) {
        case 'REFLECTIVE':
          vm.mode = 'REFLECTIVE';
          break;
        case 'INSTANT':
          vm.mode = 'INSTANT';
          break;
      }
      vm.backText = 'Questions';
    }

    /**
     * Submits the student's reflective assessment response to the server, makes sure that
     * there is something other then whitespace for the response
     */
    function submitReflectiveAssessmentResponse() {
      const content  = vm.input.response;
      if (content.trim().length === 0) {
        toastr.info('You need content in a response to a Reflective Assessment quesiton!')
        return;
      }
      
      
      ServerService.post(
        ReflectiveAssessmentRoutes.RESPOND, 
        { 
          content,
          reflectiveAssessmentId: vm.sticky.id,
          courseSessionId: vm.courseSession.id
        },
        responseSuccess => {
          const { data } = responseSuccess;
          const { success } = data;
          const { responses } = data;
          const { id } = data;
          
          if (success) {
            vm.responding = false;
            vm.reviewing = true;
            // vm.sticky.responses = responses;
            // vm.sticky.visibleResponses = responses.filter(getVisibleResponses);
            vm.input.response = '';
          }
        },
        responseFail => {
        }
      );
    }
    
    
    function voteOnResponse(response, type) {
      ServerService.p(ReflectiveAssessmentRoutes.VOTE_ON_RESPONSE, {
        courseSessionId: vm.courseSession.id,
        reflectiveAssessmentId: vm.sticky.id,
        voteType: type,
        responseId: response._id,
      })
        .then((data) => {
          vm.sticky.visibleResponses= vm.sticky.visibleResponses
            .filter(r => r._id !== response._id);
          $scope.$apply();
        })
    }

    function dismissResponse(response) {
      ServerService.p(ReflectiveAssessmentRoutes.VOTE_ON_RESPONSE, {
        courseSessionId: vm.courseSession.id,
        reflectiveAssessmentId: vm.sticky.id,
        voteType: 'DISMISS',
        responseId: response._id,
      })
        .then((data) => {
          vm.sticky.visibleResponses= vm.sticky.visibleResponses
            .filter(r => r._id !== response._id);
          $scope.$apply();
        })
    }

    /*
     Helper within the function to send question to server and save it
     */
    function sendQuestionToServer(question){
      ServerService.p(CourseSessionRoutes.QUESTIONS_ADD, {
        content: question,
        created: new Date(),
        courseSessionId: vm.courseSession.id
      })
          .then((data) => {
            const { success } = data;

            if (success) {
              vm.modeAskQuestion = false;
              vm.backText = 'Courses';
              vm.input.question = '';

              toastr.success('Question submitted successfully!');
              vm.mode = 'QUESTIONS';
              $scope.$apply();
            }
          })
    }


    /**
     * When the 'Ok' button is clicked on the question input card the question will be sent
     * to the server. Nothing is done if the question just contains whitespace.
     *
     * @param question {string} - the question content that the student would like to submit
     */
    function submitQuestion(question) {
      // Do not allow empty questions
      if (question.trim().length === 0) {
        toastr.info('Question Invalid', 'You must have some content for a question');
        return;
      }
      
      const wordArray = question.split(' ');
      let noLongWords = true;
      
      wordArray.forEach(w => {
        if (w.length >= 16) {
          noLongWords = false;
        }
      });
      
      if (!noLongWords) {
        toastr.info('Please ask a question with smaller words');
        return;
      }


      /*
      Code for similarity checking
       */
      console.log("Num Questions : " + vm.questionList.length);
      if(vm.questionList.length>0){
       QuestionListService.checkSimilarity(question,vm.questionList,
           similarityIndex =>{
             //i.e. nothing similar found
             if(similarityIndex == -1){
               console.log("No similar questions here : " + similarityIndex);
               vm.sendQuestionToServer(question);
             }else{
               console.log(isNaN(similarityIndex));
               console.log("Similar found, build vote logic here");
               console.log(JSON.stringify(similarityIndex));
               $scope.$broadcast('SIMILAR_QUESTION_ATTEMPTED',
                   {
                     question : vm.questionList[similarityIndex],
                     courseSessionId: vm.courseSession.id,
                     userId: vm.userId
                   });
               vm.modeAskQuestion = false;
               vm.backText = 'Courses';
               vm.input.question = '';
               vm.mode = 'QUESTIONS';
               $scope.$apply();
             }
            }
       );
      }
      else{//first question, this must be added
        vm.sendQuestionToServer(question);
      }



    }


    /**
     * Allows the user to upvote a question
     * 
     * @param {object} question - The StudentQuestion that is being voted on
     * @param {string} question._id - The id associated with this Question
     * @param {string} question.userId - The id associated with the User that posted the Question
     */
    function upVoteQuestion(question) {
      if (!!question.loading) return;
      question.loading = true;
      voteOnQuestion(VoteType.UP, question);
    }

    /**
     * Allows the user to downvote a question
     *
     * @param {object} question - The StudentQuestion that is being voted on
     * @param {string} question._id - The id associated with this Question
     * @param {string} question.userId - The id associated with the User that posted the Question
     */
    function downVoteQuestion(question) {
      if (!!question.loading) return;
      question.loading = true;
      voteOnQuestion(VoteType.DOWN, question);
    }

    /**
     * Submits a vote of a specific type to the server for a particular question
     * @param {object} question - The StudentQuestion that is being voted on
     * @param {string} question._id - The id associated with this Question
     * @param {string} question.userId - The id associated with the User that posted the Question
     * @param {string} type - The type of the vote
     */
    function voteOnQuestion(type, question) {

      const vote = {
        type,
        created: new Date()
      };

      ServerService.post(CourseSessionRoutes.QUESTIONS_VOTE, {
        type,
        courseSessionId: vm.courseSession.id,
        questionId: question._id,
        vote,
        questionUserId: question.userId
      }, successResponse => {
        const { data } = successResponse;
        const { success } = data;



        if (success) {
          if (type === 'UP') {
            vm.votedOn[question._id] = true;
            question.rank++;
          } else if (type === 'DOWN') {
            vm.votedOn[question._id] = false;
            question.rank--;
          }
          SocketService.informVotedOnQuestion(vm.courseSession.id);
        }

        if (!$rootScope.votedOn) {
          $rootScope.votedOn = {};
        }

        $rootScope.votedOn[question._id] = true;

        if (data.ownQuestion) {
          // QUICK FIX, make this better
          toastr.info('You can\'t vote on your own question.');
        }

        question.loading = false;
      }, failResponse => {
      });
    }


    /**
     * When the add question button is clicked the session will change to inputmode
     * which will prompt the user to enter in a question
     */
    function beginQuestionInputMode() {

      QuestionListService.isQuestionListActive(vm.courseSession.id, function(val){
        if(!!val){
          vm.mode = 'ASK';
          vm.modeAskQuestion = true;
          vm.backText = 'Questions'
        }
        else {
          toastr.error("ASK has been disabled by your instructor. Please wait for them to start taking questions!");
        }
      });

    }

    /**
     * Initializes the input object and sets the question and answer input to
     * an empty string
     * 
     * @param vm {object} - The ViewModel
     */
    function initInput(vm) {
      vm.input = {};
      vm.input.response = '';
      vm.input.question = '';
    }

    /**
     * Initializes the courseSession object that is a member of the vm. This courseSession
     * object holds the id for the Course Session, the id for the Course, and the code for
     * the Course
     */
    function initCourseSession($stateParams) {
      vm.courseSession = {};
      vm.courseSession.courseId = $stateParams.data.courseId;
      vm.courseSession.id = $stateParams.data.courseSessionId;
      vm.courseSession.classCode = $stateParams.data.code || '';
      vm.courseSession.askedQuestions = {};
      vm.courseSession.activeAlerts = -1;
      vm.courseSession.activeAlertPercent = 0;
    }

    /**
     * Notifies the student that Class is over by displaying the overlay and a message.
     */
    function notifyThatClassIsOver() {
      vm.showOverlay = true;
      vm.showClassIsOver = true;
    }

    /**
     * When the "Ok" button is pressed after the student has been informed that the Class
     * is over
     */
    function acknowledgeClassIsOver() {
      vm.showOverlay = false;
      vm.showClassIsOver = false;
      $state.go('dash.courses.active');
    }

    /**
     * When the confusion button is clicked a toast notification will alert the user and
     * a ConfusionPoint will be created and send to the server.
     */
    function submitConfusion() {

      ServerService.p(CourseSessionRoutes.ALERTS_ADD,
        { created: new Date(),
          courseSessionId: vm.courseSession.id
        })
        .then((data) => {
          const { success } = data;
          if (success) {
            $scope.$apply();
          }
        });
      vm.showOverlay = true;
      vm.showConfusionNoted = true;

    }

    /**
     * When the "Ok" button is pressed which indicates that the student is aware that their
     * ConfusionPoint was submitted, so update the UI accordingly
     */
    function acknowledgeConfusionSubmit() {
      vm.showOverlay = false;
      vm.showConfusionNoted = false;
    }
    
    /**
     * Sets all View Model variables to the values that they should be when a user first enters the
     * state of Dash Main
     * 
     * @param vm {object} - The ViewModel
     */
    function initUIFlags(vm) {
      vm.modeAskQuestion = false;
      vm.responding = false;
      vm.reviewing = false;
      vm.showOverlay = false;
      vm.showClassIsOver = false;
      vm.showConfusionNoted = false;
      vm.askingQuestion = false;
      vm.questionFilter = 'MOST_RECENT';
      vm.backText = 'Courses'
    }


    /**
     * Check to make sure there is a valid Session for the user to access this state, if there is not
     * take the user to launch.login
     * 
     * @param $stateParams {object} - The $stateParams that is passed into this state when
     * the user joins it
     * @param $stateParams.data {object} - The data that is necessary for the state to initialize
     */
    function determineIfHasValidSession($stateParams) {
      if (!$stateParams.data) {
        $state.go('launch.login');
      }
    }
    

    /**
     * Initializes a Reflective Assessment by creating a sticky, assigning it the necessary information
     * from the created Reflective Assessment and takes the user to the responding stage of the
     * Reflective Assessment mode.
     *
     * @param id {string} - The id of the Reflective Assessment
     * @param prompt {string} - The prompt of the Reflective Assessment
     * @param created {date} - The date that the Reflective Assessment was created
     */
    function initReflectiveAssessment(id, prompt, created) {
      // Create a sticky to display
      vm.sticky = { id, created, content: prompt, type: 'REFLECTIVE' };

      // Display the sticky on the View
      vm.showSticky = true;

      // Take the student to the response screen
      vm.mode = 'REFLECTIVE';
      vm.responding = true;
      vm.reviewing = false;
      
      // Create an array for the responses, only used on Reflective Assessment
      vm.sticky.responses = [];
      vm.sticky.visibleResponses = [];

      // Make a new Hash Map for keeping track of what responses have been reviewed
      vm.sticky.responsesReviewed = {};
      vm.sticky.dismissedResponses = {};

      vm.backText = 'Questions';
    }
    
    /**
     * Initializes a Reflective Assessment by creating a sticky, assigning it the necessary information
     * from the created Reflective Assessment and takes the user to the responding stage of the
     * Reflective Assessment mode. Use this when the Reflective Assessment has already started when the
     * user gets into the Course Session
     *
     * @param id {string} - The id of the Reflective Assessment
     * @param prompt {string} - The prompt of the Reflective Assessment
     * @param created {date} - The date that the Reflective Assessment was created
     */
    function initExistingReflectiveAssessment
    (
      id, prompt, created, responses, visibleResponses, responsesReviewed, responding
    ) {
      // Create a sticky to display
      vm.sticky = { id, created, content: prompt, type: 'REFLECTIVE' };

      // Display the sticky on the View
      vm.showSticky = true;

      vm.responding = responding;
      vm.reviewing = !responding;

      // Create an array for the responses, only used on Reflective Assessment
      vm.sticky.responses = responses;
      vm.sticky.visibleResponses = vm.sticky.responses.filter(getVisibleResponses);

      // Make a new Hash Map for keeping track of what responses have been reviewed
      vm.sticky.responsesReviewed = responsesReviewed;

      if ($rootScope.dismissedResponses) {
        vm.sticky.dismissedResponses = $rootScope.dismissedResponses;
      }
    }

    /**
     * Returns an array of the responses that the user has not reviewed yet
     * 
     * @param responses - The responses for the Free Response Assessment
     * @param responsesReviewed - The hashmap of responses that have been reviewed
     */
    function filterResponses(responses, responsesReviewed) {
      if (!responses || !responsesReviewed) {
        return;
      }
      
      return responses.filter(r => !responses[r._id]);
    }

    /**
     * Queries the server to see if there are any active Assessments in this Course Session,
     * if there is the UI will be set to acknowledge that 
     * 
     * @param courseSessionId {string} - The id associated with this Course Session
     */
    function receivePriorSelections(courseSessionId) {
      ServerService.post(CourseSessionRoutes.ASSESSMENTS_GET_PRIOR_SELECTIONS,
        {
          courseSessionId
        }, responseSuccess => {
          const { data } = responseSuccess;
          const { success } = data;
          const { type } = data;
          

          if (success) {
            const { responses, responding, visibleResponses, responsesReviewed, id, prompt,
              created, options, optionSelected } = data;

            switch (type) {
              case 'REFLECTIVE':
                initExistingReflectiveAssessment(id, prompt, created, responses, visibleResponses,
                  responsesReviewed, responding);
                break;
              
              case 'INSTANT':
                initExistingInstantAssessment(id, prompt, created, options, optionSelected);
                break;

              case 'NONE':
                vm.showSticky = false;
                break;
            }
          }
        }, responseFail => {}
      )
    }


    /**
     * Initializes an Instant Assessment by creating a sticky, assigning it the necessary information
     * from the created Instant Assessment and takes the user to the responding stage of the
     * Instant Assessment mode.
     *
     * @param id {string} - The id of the Instant Assessment
     * @param prompt {string} - The prompt of the Instant Assessment
     * @param created {date} - The date that the Instant Assessment was created
     */
    function initInstantAssessment(id, prompt, created, options) {
      // Create a sticky to display
      vm.sticky = { id, created, content: prompt, type: 'INSTANT' };
      
      // Display the sticky on the View
      vm.showSticky = true;

      vm.askingQuestion = false;

      // Take the student to the response screen
      vm.mode = 'INSTANT';

      // Create an array for the options of the Instant Assessment
      if (options.length > 0) {
        vm.sticky.options = [];
        options.forEach(o => {
          vm.sticky.options.push(o.content);
        })
      } else if (options.length === 0){
        vm.sticky.options = ['', '', '', '', ''];
      }

      // Initialize the selected option as null
      vm.sticky.optionSelected = null;
      
      vm.backText = 'Questions';
    }
    
    /**
     * Initializes an Instant Assessment by creating a sticky, assigning it the necessary information
     * from the created Instant Assessment and takes the user to the responding stage of the
     * Instant Assessment mode. Use this method when the User first joins the state and finds an active
     * Instant Assessment.
     *
     * @param id {string} - The id of the Instant Assessment
     * @param prompt {string} - The prompt of the Instant Assessment
     * @param created {date} - The date that the Instant Assessment was created
     */
    function initExistingInstantAssessment(id, prompt, created, options, optionSelected) {
      // Create a sticky to display
      vm.sticky = { id, created, content: prompt, type: 'INSTANT' };

      // Display the sticky on the View
      vm.showSticky = true;

      // Create an array for the options of the Instant Assessment
      if (options.length > 0) {
        vm.sticky.options = [];
        options.forEach(o => {
          vm.sticky.options.push(o.content);
        })
      } else {
        vm.sticky.options = ['', '', '', '', ''];
      }

      // Initialize the selected option as null
      vm.sticky.optionSelected = optionSelected;
    }

    /**
     * Updates the Instant Assessment to account for a choice of a particular option, if the option
     * has not been not been chosen yet or that option is not active this function will set the
     * active option to the letter that corresponds to the option index; if that index/option has
     * already been chosen the index/option will be un-selected
     * 
     * @param index {number} - The index corresponding to the option selected
     */
    function clickOption(index) {
      InstantAssessmentService
        .clickOption(index, vm.sticky.optionSelected, vm.sticky.id, vm.courseSession.id, 
          (err, selection) => {
            if (err) {
              console.error(err);
              return
            }
            vm.sticky.optionSelected = selection;
        });
    }
    

    /**
     * Determines what text content to show on the sticky
     * 
     * @param sticky {object} - The sticky object
     * @returns {string}
     */
    function determineStickyContent(sticky) {
      if (!sticky) return '';
      
      const { type, content } = sticky;
      
      switch (type) {
        case 'REFLECTIVE':
          return (content) 
            ? `Reflective Assessment: ${content}`
            : 'Reflective Assessment: Verbal or slide question proposed.'
        
        case 'INSTANT':
          return (content)
            ? `Instant Assessment: ${content}`
            : `Instant Assessment: Verbal or slide question proposed.`
      }
    }

    function getVisibleResponses(r) {
      if (r.userId.toString() === vm.userId.toString()) return false;
      const userVote = r.votes.filter(v => {
        return v.userId.toString() === vm.userId.toString() && r.userId.toString() !== vm.userId.toString()
      })[0];
      return !userVote;
    }


    const RA_STARTED = `${SocketRoutes.REFLECTIVE_ASSESSMENT_STARTED}:${vm.courseSession.id}`;
    $rootScope.$on(RA_STARTED, (event, data) => {
      initReflectiveAssessment(data.id, data.prompt, data.created);
      $scope.$apply();
    });

    $rootScope.$on('RA_RESPONSE_RECEIVED', (event, data) => {
      const { responses } = data;
      vm.sticky.responses = responses;
      vm.sticky.visibleResponses = responses.filter(getVisibleResponses);
      $scope.$apply();
    });
    
    const RA_STOP = `${SocketRoutes.REFLECTIVE_ASSESSMENT_STOP}:${vm.courseSession.id}`;
    $rootScope.$on(RA_STOP, (event, data) => {
      stopReflectiveAssessment();
      $scope.$apply();
    });
    
    const IA_STARTED = `${SocketRoutes.INSTANT_ASSESSMENT_STARTED}:${vm.courseSession.id}`;
    $rootScope.$on(IA_STARTED, (event, data) => {
      initInstantAssessment(data.id, data.prompt, data.created, data.options);
      $scope.$apply();
    });
    
    const MC_STOP = `${SocketRoutes.MC_STOP}:${vm.courseSession.id}`;
    $rootScope.$on(MC_STOP, (event, data) => {
      stopInstantAssessment();
      $scope.$apply(); 
    });


    $rootScope.$on('COURSE_SESSION_END', (event, data) => {
      notifyThatClassIsOver();
      $scope.$apply();
    });

    $rootScope.$on($rootScope.username, (event, data) => {
      toastr.info('This account has logged in elsewhere');
      vm.logOut();
    });


    const confusionBar = document.getElementById('confusionbar');
    // Interval to get confusion amount
    const ONE_SECONDS = 1000;
    const getConfusion = $interval(() => {
      ServerService.p(CourseSessionRoutes.ALERTS_GET_NUMBER_AND_PERCENT, {
        courseSessionId: vm.courseSession.id,
      })
        .then((result) => {
          const { number, percent, threshold } = result;

          try {
            $scope.$apply(() => {
              confusionBar.style.width = `${vm.courseSession.activeAlertPercent}%`;
            });
          } catch (e) {
            // Handle silently
          }
          vm.courseSession.activeAlerts = number;
          vm.courseSession.activeAlertPercent = percent;
          vm.courseSession.threshold = threshold || 20;
        })

    }, ONE_SECONDS);
    intervals = [...intervals, getConfusion];

    // Interval Function To Check Connection Status
    const FIVE_SECONDS = 5000;
    const checkConnection = $interval(()=>{
      if(!window.navigator){
        vm.connectionStatus = "unknown";
      }
      else{
        let socketStatus = $rootScope.socket.connected;
        let networkStatus = window.navigator.onLine;


        if(!socketStatus && !networkStatus){
          vm.connectionStatus = "disconnected";
        }
        else if((!socketStatus && networkStatus) || (socketStatus && !networkStatus) ){
          vm.connectionStatus = "unstable";
        }
        else {
          vm.connectionStatus = "connected";
        }
      }

    }, FIVE_SECONDS);
    intervals = [...intervals, checkConnection];

    $scope.$on('$destroy', () => {
      intervals.forEach((i) => { $interval.cancel(i) })
    })

  }

})();
