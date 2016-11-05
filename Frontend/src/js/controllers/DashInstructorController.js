/** Author: Anthony Altieri **/

(() => {
  'use strict';

  angular
    .module('app')
    .controller('DashInstructorController', DashInstructorController);

  DashInstructorController.$inject = [
    '$rootScope', '$scope', '$log', '$state', '$stateParams', '$interval', 'ServerService',
    'ReflectiveAssessmentRoutes', 'SocketService', 'SocketRoutes', 'CourseSessionRoutes',
    'CourseRoutes', 'CourseSessionService', 'InstantAssessmentService'
  ];

  function DashInstructorController
  (
    $rootScope, $scope, $log, $state, $stateParams, $interval, ServerService, ReflectiveAssessmentRoutes,
    SocketService, SocketRoutes, CourseSessionRoutes, CourseRoutes, CourseSessionService, InstantAssessmentService
  ) {

    //Number of hours for which the confusion data is saved on client - currently this is just the last 10 mins of data
    const CONFUSION_COOKIE_VALIDITY = 3;

    let vm = this;


    if (!$stateParams.data) {
      $state.go('launch.login');
      return
    }

    init(vm, $stateParams);

    vm.numberQuestions = 0;

    let intervalPromises = [];

    // Course Session \\
    vm.endCourseSession = endCourseSession;

    // State Navigation
    vm.goToDashClasses = goToDashClasses;

    // Tab Navigation
    vm.clickTabHome = clickTabHome;
    vm.clickTabAssessment = clickTabAssessment;

    vm.useForAssessment = useForAssessment;

    // Instant Assessment
    vm.addAnswer = addAnswer;
    vm.clearInstantAssessmentOption = clearInstantAssessmentOption;
    vm.activeAssessmentId = null; //set when an assessment starts


    //connection status
    vm.connectionStatus = "connected";
    $rootScope.loading = false;

    //Overlay to confirm end session
    vm.showEndSessionOverlay = false;

    //alter courseSession Confusion threshold
    vm.confusionThresholdSelectedValue;//we set this equal to default confusion threshold for the session
    vm.setThreshold = setThreshold;

    // Sockets
    handleSockets(SocketService, vm.courseSession.id);

    function init(vm, $stateParams) {
      writeLocalStorage("stateParams", $stateParams);
      const { courseSessionId, code, courseId, instructorName, confusionThreshold } = $stateParams.data;
      initInput(vm);
      initCourseSession(vm, courseSessionId, code, courseId, confusionThreshold);
      getAttendance()
        .then((attendance) => { vm.courseSession.attendance = attendance });
      goTabHome(vm);
      generateAssessmentObjects(vm);
      ServerService.p(CourseSessionRoutes.ALERTS_GET_NUMBER_ACTIVE, {})
        .then((data) => {
          const { success, activeAlerts } = data;
          if (success) {
            vm.courseSession.activeAlerts = activeAlerts;
          }
        })
        .catch((error) => {})
      vm.instructorName = instructorName;
    }

    $scope.$on('QUESTION_LIST_INIT', (event, data) => {
      $scope.$broadcast('COURSESESSION_JOINED_QUESTION', {
        courseSessionId: vm.courseSession.id
      })
    });

    $scope.$on('ASSESSMENT_INIT', (event, data) => {
      $scope.$broadcast('COURSESESSION_JOINED', {
        courseSessionId: vm.courseSession.id
      })
    });



    /*
    Angular-nvd3 Bar Graph Setup
     */

    //Flag to indicate whether there's valid data to show on the graph or not (valid only after answers received)
    vm.showInstantAssessmentGraph = false;

    vm.instantAssessmentGraph = {};

    //Graph Config
    vm.instantAssessmentGraph.options = {
      chart: {
        type: 'discreteBarChart',
        height: 450,
        width: 650,//TODO: FIGURE OUT HOW TO MAKE THESE RESPONSIVE
        yDomain : [0,100],
        x: function(d){return d.label;},
        y: function(d){return d.value;},
        showValues: true,
        duration: 500,
        xAxis: {
          axisLabel: 'Options'
        },
        yAxis: {
          axisLabel: '% of students',
          axisLabelDistance: -10
        },
        callback: function(chart){
          d3.selectAll("rect").on('click', function (e,i, nodes) {
            console.log(JSON.stringify(i, null, 2));
            /*
             Experimentally observed index conversion
             */
            let correctIndex = i-4;
            if(correctIndex>=0&&correctIndex<5) {
              if(vm.selectedAssessment==='INSTANT') {
                console.log("Stats of selections");
                console.log(JSON.stringify(vm.activeAssessment, null, 2));
                console.log(JSON.stringify(vm.instantAssessment, null, 2));
                console.log(JSON.stringify(vm.activeAssessmentId, null, 2));
                InstantAssessmentService.markCorrectOption(vm.activeAssessmentId, correctIndex);
              }
            }
          });




        }

      }
    };

    //Graph Data - this is always an array of objects in nvd3
    vm.instantAssessmentGraph.data = [
      {
        key: "first attempt",
        values:
          [
            {
              "label" : "A" ,
              "value" : 0
            } ,
            {
              "label" : "B" ,
              "value" : 0
            } ,
            {
              "label" : "C" ,
              "value" : 0
            } ,
            {
              "label" : "D" ,
              "value" : 0
            } ,
            {
              "label" : "E" ,
              "value" : 0
            }]
      }
    ];

    /*
    Confusion Line Graph Initialization
     */

    //Constants for time math regarding confusion line
    //We want to show only last 10 minutes of confusion data
    const INTERVAL_TIME = 3000;//1 request every 3 seconds
    const TOTAL_MINUTES = 10;//the amount we want to show the professor
    const TOTAL_TIME = TOTAL_MINUTES*60000;//milliseconds
    const NUM_DATAPOINTS = TOTAL_TIME/INTERVAL_TIME;
    const STEP_SIZE = Number((TOTAL_MINUTES/NUM_DATAPOINTS).toFixed(2));
    //Cookie for confusion graph Data to be saved with name courseSessionId-confusion
    let confusionGraph = readLocalStorage(vm.courseSession.id+"-confusionData");


    //Cookie doesn't exist, must initialize it
    if(!confusionGraph){

      vm.confusionGraph = {};
      vm.confusionGraph.options= {
        chart: {
          type: 'lineChart',
          height: 260,
          yDomain : [0,100],
          x: function(d){ return d.x; },
          y: function(d){ return d.y; },
          useInteractiveGuideline: true,
          dispatch: {
            stateChange: function(e){ },
            changeState: function(e){ },
            tooltipShow: function(e){ },
            tooltipHide: function(e){ }
          },
          yAxis: {
            axisLabel: 'Percentage of Students',
            axisLabelDistance : -10
          },
          xAxis: {
            axisLabel: 'Time (minutes)'
          },
          callback: function(chart){

          }
        }
      };
      //Will be used to store all the confusion values. To Be Used Later for Zoomout onDblClick
      let confusionValues =  [];
      let threshValues = [];

      //Initialize data points with confusion value 0
      for(let i = 0; i <= NUM_DATAPOINTS; i++){
        confusionValues.push({ x:Number(((-1)*(TOTAL_MINUTES)+(i)*STEP_SIZE).toFixed(2)) , y:0});
        threshValues.push({x:Number(((-1)*(TOTAL_MINUTES)+(i)*STEP_SIZE).toFixed(2)), y:vm.courseSession.confusionThreshold});
      }


      vm.confusionGraph.data = [
        {
          values : confusionValues,
          key : 'Live Confusion',
          color : '#7777ff',
          area : true
        }
        ,
        {
          values : threshValues,
          key : 'Confusion Threshold',
          color : '#42AFAC'
        }
      ];

      //cookie valid for 'CONFUSION_COOKIE_VALIDITY' hours and has name = courseSessionID
      writeLocalStorage(vm.courseSession.id+"-confusionData", vm.confusionGraph);
    }
    else{
      vm.confusionGraph = confusionGraph;
    }

    // Update the clock every minute
    vm.time = new Date();
    const promiseTime = $interval(() => {
      vm.time = new Date();
    }, 1000);
    intervalPromises.push(promiseTime);

    function handleSockets(SocketService, courseSessionId) {
      SocketService.handleStudentJoinedCourseSession(courseSessionId);
      SocketService.handleStudentLeaveCourseSession(courseSessionId);
      SocketService.handleReflectiveAssessmentResponseInstructor(courseSessionId);
      SocketService.handleMCSelectionMade(courseSessionId);
      SocketService.handleReflectiveAssessmentResponseReviewed(courseSessionId);
      SocketService.handleAlertAdded(courseSessionId);
    }

    function activateCurrentAssessment() {
      switch (vm.selectedAssessment) {
        case 'REFLECTIVE':
          activateReflectiveAssessment(vm.courseSession.id, vm.input.propose)
          break;

        case 'INSTANT':
          if (vm.instantAssessment.options.length >= 1 && vm.instantAssessment.options.length < 2) {
            toaster.error('If you are entering answers you must have at least 2.');
            return;
          }
          activateInstantAssessment(vm.courseSession.id, vm.input.propose,vm.instantAssessment.options);
          break;
      }
    }


    /**
     * Activates a Reflective Assessment for the current course session and
     * question
     *
     * @param courseSessionId {String} - The id of the Course Session that is being affected
     * @param questionContent {String} - The content of the Course Session question that is being proposed
     */
    function activateReflectiveAssessment(courseSessionId, questionContent) {
      ServerService.post(ReflectiveAssessmentRoutes.ADD, {
        courseSessionId,
        questionContent
      },
      responseSuccess => {
        const { data } = responseSuccess;
        const { success, id } = data;

        if (success) {
          initActiveAssessment('REFLECTIVE', id, vm.reflectiveAsssessment);

          vm.input.propose = '';

          toastr.success("Reflective Assessment", "Watch the live-data from the class");
        }
      })
    }

    function activateInstantAssessment(courseSessionId, content, options) {
      ServerService.post(InstantAssessmentRoutes.CREATE,
        {
          courseSessionId, content, options
        },
        responseSuccess => {
          const { data } = responseSuccess;
          const { success, instantAssessmentId } = data;

          if (success) {
            initActiveAssessment('INSTANT', instantAssessmentId, vm.instantAssessment);

            vm.input.propose = '';

            toastr.success('Instant Assessment Started', 'Watch the live-data from the class');
          }
        }, responseFail => {}
      );

    }

    /**
     * Initializes an active Assessment depending on the type that is passed in. The active assessment is given
     * the assessment to be initialized's id and information to fill out the UI
     *
     * @param type {String} - The type of assessment that is being activated, either REFLECTIVE or INSTANT
     * @param id {String} - The id associated with the assessment that is being activated
     * @param assessment {Object} - An Instant or Reflective assesment object
     */
    function initActiveAssessment(type, id, assessment) {
      if (type === 'REFLECTIVE') {
        vm.reflectiveAssessmentSelected = true;
        vm.instantAssessmentSelected = false;
        vm.selectedAssessment = 'REFLECTIVE';
        vm.activeAssessment = initReflectiveAssessment(assessment, id, vm.courseSession.attendance);
      } else if (type === 'INSTANT') {
        vm.instantAssessmentSelected = true;
        vm.reflectiveAssessmentSelected = false;
        vm.selectedAssessment = 'INSTANT';
        vm.activeAssessment = initInstantAssessment(assessment, id, vm.courseSession.attendance);

      }
    }


    function useForAssessment(content) {
      vm.tabSelected = 'ASSESSMENT';
      $scope.$broadcast('USE_FOR_ASSESSMENT', {
        content,
        courseSessionId: vm.courseSession.id
      });
    }

    /**
     * Reveals the UI elements that should show when the "Home" tab is clicked
     */
    function clickTabHome() {
      vm.tabSelected = 'HOME';
    }

    /**
     * Revealse the UI elemetns that should show when the "Assessment" tab is clicked
     */
    function clickTabAssessment() {
      vm.tabSelected = 'ASSESSMENT';
    }

    /**
     * Takes the user to the Dash Classes state
     */
    function goToDashClasses() {
      $state.go('dash.courses.active');
    }

    /**
     * Initializes the objects that will keep track of current Assessments
     */
    function generateAssessmentObjects(vm) {
      vm.selectedAssessment = 'INSTANT'; // Default
      vm.instantAssessmentSelected = true;
      vm.reflectiveAssessmentSelected = false;

      vm.activeAssessment = null;

      vm.reflectiveAsssessment = generateReflectiveAssessment();

      vm.instantAssessment = generateInstantAssessment();
    }

    function initReflectiveAssessment(reflectiveAssessment, id, attendance) {
      return {
        id,
        type: 'REFLECTIVE',
        question: reflectiveAssessment.question,
        numberAnswered: reflectiveAssessment.responses
          ? reflectiveAssessment.responses.length
          : 0,
        percentAnswered: reflectiveAssessment.responses
          ? reflectiveAssessment.responses.length / attendance
          : 0,
        numberReviewed: reflectiveAssessment.responses
          ? reflectiveAssessment.responses.filter(r => r.votes.length > 0).length || 0
          : 0
      }
    }

    function initInstantAssessment(instantAssessment, id, attendance) {
      let array = [];
      return {
        id,
        type: 'INSTANT',
        options: (instantAssessment.options)
          ? instantAssessment.options.forEach(o => { array.push(o) })
          : ['','','',''],
        numberAnswered: (instantAssessment.answers)
          ? instantAssessment.answers.length
          : 0,
        percentAnswered: instantAssessment.answers
          ? `${Math.floor(instantAssessment.answers.length / attendance)}%`
          : '0%',
      }
    }

    /**
     * Generates a blank default Reflective Assessment object
     */
    function generateReflectiveAssessment() {
      return {
        type: 'REFLECTIVE',
        question: '',
        numberAnswered: 0,
        percentAnswered: '0%',
        numberReviewed: 0
      }
    }

    /**
     * Generates a blank default Instant Assessment object
     */
    function generateInstantAssessment() {
      return {
        type: 'INSTANT',
        options: [],
        numberAnswered: 0,
        percentAnswered: '0%'
      }
    }



    /**
     * Clears an option from an Instant Asssessment that is being prepared, will just return
     * and not do anything if there is an Instant Assessment active
     *
     * @param index {number} - The index of the option that is being cleared from the Instant Assessment
     */
    function clearInstantAssessmentOption(index) {
      if (vm.activeAssessment) return;
      vm.instantAssessment.options.splice(index, 1);
    }

    /**
     * Adds an answer to an Instant Assessment that is being prepared, will not let the user
     * create an answer that has a word that is longer than 24 characters or that has no content.
     *
     * @param content {string} - The text of the answer
     */
    function addAnswer(content) {
      if (content.trim().length === 0) {
        toastr.info('Answer must have content');
        return;
      }

      let hasWordTooLong = false;

      content
        .split(' ')
        .forEach(w => {
          if (w.length >= 24) {
            hasWordTooLong = true;
          }
        });

      if (hasWordTooLong) {
        toastr.info('Cannot have a word that is longer than 24 characters '
          + 'please re-write your answer');
        return;
      }

      vm.instantAssessment.options.push(content.trim());
      vm.input.answer = '';
    }

    /**
     * Initializes the input object and sets the propose and answer input to
     * an empty string
     */
    function initInput(vm) {
      vm.input = {};
      vm.input.propose = '';
      vm.input.answer = '';
    }

    /**
     * Makes the selected Assessment Instant
     */
    function selectInstantAssessment() {
      if (vm.activeAssessment) return;
      vm.selectedAssessment = 'INSTANT';
    }

    /**
     * Makes the selected Assessment Reflective
     */
    function selectReflectiveAssessment() {
      if (vm.activeAssessment) return;
      vm.selectedAssessment = 'REFLECTIVE';
    }

    /**
     * Initializes the variables that will make the Home tab the initial tab the user is on when
     * they first get to the state
     */
    function goTabHome(vm) {
      vm.tabSelected = 'HOME';
    }

    /**
     * Initializes the vm.session object with its default values and resets the metrics
     * that are associated with the active Reflective Assessment
     *
     * @param courseSessionId {string} - The id associated with the Course Session
     * @param code {string} - The course code for this course
     * @param courseId {string} - The id associated with the Course this Course Session is for
     */
    function initCourseSession(vm, courseSessionId, code, courseId, confusionThreshold) {
      vm.courseSession = {
        id: courseSessionId,
        active: true,
        courseId,
        code,
        attendance: 0,
        isRAActive: false,
        activeAlerts: 0,
        confusionThreshold,
        recentDiscussionAnswers: []
      };
      vm.confusionThresholdSelectedValue = vm.courseSession.confusionThreshold;
      writeLocalStorage(vm.courseSession.id+"-confusionThreshold", vm.courseSession.confusionThreshold);
      CourseSessionService.getAttendance(courseSessionId)
        .then((data) => {
          const { attendance } = data;
          vm.courseSession.attendance = attendance || 0;
          $scope.$broadcast('STUDENT_JOINED', { attendance })
        });

      vm.lastFreeResponsePeerReview = initLastFreeResponsePeerReview();
    }

    /**
     * Creates an object that is the blank representation of the last Reflective
     * Assessment
     *
     * @returns {{topSimilar: Array, topDifferent: Array, topUnkown: Array}}
     */
    function initLastFreeResponsePeerReview() {
      return {
        top: []
      }
    }

    /**
     * The function that deals with when the instructor is tyring to dismiss a question from the
     * question list that is on their Home tab
     *
     * @param question {object} The question that is being dismissed
     * @param question._id {string} The id associated with the question that is being dismissed
     */
    function clickDismiss(question) {
      ServerService.post(CourseSessionRoutes.QUESTIONS_REMOVE, {
        questionId: question._id,
        courseSessionId: $stateParams.data.courseSessionId
      }, responseSuccess => {
        let data = responseSuccess.data;
        let success = data.success;

        if (!success) {
          toastr.error(`Server Error Please Try Again!`);
        } else {
          vm.courseSession.questions = vm.courseSession
            .questions
            .filter(q => q._id.toString() !== question._id.toString())
        }
      }, responseFail => {});
    }

    /**
     * Begins a new Reflective Assessment with a question that has been asked by a student
     *
     * @param question {object} - The question that is going to be used as a newly created Reflective
     * Assessment
     * @param question.content {string} - The string that is the actual content of the question
     */
    function useForReflectiveAssessment(question) {
      activateReflectiveAssessment(vm.courseSession.id, question)
    }


    function getAttendance(courseSessionId) {
      return new Promise((resolve, reject) => {
        ServerService.post(CourseSessionRoutes.ATTENDANCE_GET, { courseSessionId
          }, (resSuccess) => {
            const { data } = resSuccess;
            const { success, attendance } = data;

            if (success) {
              resolve(attendance);
              return
            }

            reject(null)
          }, resFail => {});
        })
    }


    /**
     * Ends a Course Session and notifies the Student's that the Course Session has ended, this
     * will make the current Course Session inactive so students can't join it again
     */
    function endCourseSession() {
      ServerService.post(CourseRoutes.COURSESESSION_ACTIVE_END, {
        courseId: vm.courseSession.courseId
      }, responseSuccess => {
        const { data } = responseSuccess;
        const { success } = data;

        if (success) {
          vm.courseSession.active = false;
          toastr.success('Successfully ended Course Session');
        }
      }, responseFail => {

      });
      vm.showEndSessionOverlay = false;

    }


    const promiseGetAlertsInWindow = $interval(() => {
      ServerService.post(CourseSessionRoutes.ALERTS_GET_NUMBER_ACTIVE, {
        courseSessionId: vm.courseSession.id
      }, responseSuccess => {
        const { data } = responseSuccess;
        const { success } = data;
        const { activeAlerts }  = data;
        if (success) {
          vm.courseSession.activeAlerts = activeAlerts;

          if((vm.courseSession.activeAlerts/vm.courseSession.attendance*100)>=vm.courseSession.confusionThreshold){
            vm.confusionGraph.data[0].color = '#FC539C';
          }
          else{
            vm.confusionGraph.data[0].color = '#7777ff';
          }

          let str = " STR ";

          let i = 0;

          //for each of the series
          for(i; i<vm.confusionGraph.data.length; i++){
            vm.confusionGraph.data[i].values = vm.confusionGraph.data[i].values.splice(1,(vm.confusionGraph.data[i].values.length-1));
            vm.confusionGraph.data[i].values.forEach(function(val){
              val.x= Number((val.x-STEP_SIZE).toFixed(2));
              str+= val.x + " ; ";
            });
          }


          let mostRecentConfusionPercentage = (vm.courseSession.activeAlerts/vm.courseSession.attendance)*100;
          let mostRecentConfusionThreshold = vm.courseSession.confusionThreshold;

          /*
          Accounting for NUll Value Bugs
           */
          if(!mostRecentConfusionPercentage){
            mostRecentConfusionPercentage = 0;
          }
          if(!mostRecentConfusionThreshold){
            mostRecentConfusionThreshold = 0;
          }
          vm.confusionGraph.data[0].values.push( {x:0, y: mostRecentConfusionPercentage, series : 0});
          vm.confusionGraph.data[1].values.push({x:0, y:mostRecentConfusionThreshold, series: 1});
          writeLocalStorage(vm.courseSession.id+"-confusionData", vm.confusionGraph);



        }
      }, responseFail => {

      });

    }, INTERVAL_TIME);//set at every 15 sec.
    intervalPromises.push(promiseGetAlertsInWindow);

    $rootScope.$on('STUDENT_JOINED', (event, data) => {
      const { attendance } = data;
      $scope.$broadcast('STUDENT_JOINED', { attendance });
      vm.courseSession.attendance = data.attendance;
    });

    const ROUTE_STUDENT_LEFT = `${SocketRoutes.STUDENT_LEFT}:${vm.courseSession.id}`;
    $rootScope.$on(ROUTE_STUDENT_LEFT, (event, data) => {
      const { attendance } = data;
      $scope.$broadcast('STUDENT_LEFT', { attendance });
      vm.courseSession.attendance = data.attendance;
    });

    $scope.$on('ALERT_ADDED', (event, data) => {
      vm.courseSession.activeAlerts = data.currentAlerts;
      $scope.$apply();
    });


    $rootScope.$on('INSTANT_ASSESSMENT_SELECTION', (event, data) => {
      vm.showInstantAssessmentGraph = true;
      const { answerObject } = data;
      let numberAnswersRecieved =
        answerObject['A'] + answerObject['B'] + answerObject['C'] + answerObject['D'] + answerObject['E'];
      vm.instantAssessmentGraph.data[0].values[0].value = (answerObject['A']/numberAnswersRecieved) * 100;
      vm.instantAssessmentGraph.data[0].values[1].value = (answerObject['B']/numberAnswersRecieved) * 100;
      vm.instantAssessmentGraph.data[0].values[2].value = (answerObject['C']/numberAnswersRecieved) * 100;
      vm.instantAssessmentGraph.data[0].values[3].value = (answerObject['D']/numberAnswersRecieved) * 100;
      vm.instantAssessmentGraph.data[0].values[4].value = (answerObject['E']/numberAnswersRecieved) * 100;

      console.log(vm.courseSession.id);
      console.log(vm.instantAssessmentGraph);
      writeLocalStorage(vm.courseSession.id+"-mcqData", vm.instantAssessmentGraph.data);
      $scope.$apply();
    });

    const ROUTE_RESPONSE_RECEIVED = `${SocketRoutes.REFLECTIVE_ASSESSMENT_RESPONSE_RECEIVED}:${vm.courseSession.id}`;
    $rootScope.$on(ROUTE_RESPONSE_RECEIVED, (event, data) => {
      $scope.$broadcast('REFLECTIVE_RESPONSE_RECEIVED', data);
      $scope.$apply();
    });

    const ROUTE_RESPONSE_REVIEWED = `${SocketRoutes.FR_RESPONSE_REVIEWED}:${vm.courseSession.id}`;
    $rootScope.$on(ROUTE_RESPONSE_REVIEWED, (event, data) => {
      vm.activeAssessment.numberReviewed = data.numberResponsesReviewed;
      $scope.$apply();
    });

    $scope.$on('QUESTIONS_USE_FOR_ASSESSMENT', (event, data) => {
      $scope.$broadcast('QUESTIONS_USE_FOR_ASSESSMENT', data);
    });

    $scope.$on('QUESTIONS_USE_FOR_ASSESSMENT', (event, data) => {
      const { content } = data;
      $scope.$broadcast('QUESTIONS_USE_FOR_ASSESSMENT', {
        content,
        courseSessionId: vm.courseSession.id
      });
    });

    $scope.$on('ALERT_ADDED', (event, data) => {
      const { currentAlerts } = data;
      vm.courseSession.activeAlerts = currentAlerts;
    });

    $scope.$on('TAB_SELECTED', (event, data) => {
      const { tab } = data;
      if (vm.tabSelected === tab) return;
      vm.tabSelected = tab;

    });

    $scope.$on('ASSESSMENT_ACTIVATED', (event, data) => {
      vm.activeAssessmentId = data.activeAssessmentId;
      writeLocalStorage(vm.courseSession.id+"-activeAssessmentId", data.activeAssessmentId);
      vm.showInstantAssessmentGraph = false;
    });

    $scope.$on('QUESTION_NUMBER', (event, data) => {
      const { number } = data;
      vm.numberQuestions = number;
      $scope.$apply();
    });


    $scope.$on('$destroy', () => {
      intervalPromises.forEach(p => {
        $interval.cancel(p);
      })
    });

    /*
    Function to reset the confusion threshold
     */
    function setThreshold(){
      if(isNaN(vm.confusionThresholdSelectedValue)||!(vm.confusionThresholdSelectedValue)){
        toastr.error("Confusion Threshold Must Be a Valid Number Between 0 & 100")
        vm.confusionThresholdSelectedValue = vm.courseSession.confusionThreshold;
      }else{
        if(vm.confusionThresholdSelectedValue>=0&&vm.confusionThresholdSelectedValue<=100) {
          ServerService
              .post(CourseSessionRoutes.ALERTS_SET_THRESHOLD, {
              courseSessionId: vm.courseSession.id,
              threshold: vm.confusionThresholdSelectedValue
              },
              responseSuccess => {
                vm.courseSession.confusionThreshold = vm.confusionThresholdSelectedValue;
                writeLocalStorage(vm.courseSession.id+"-confusionThreshold", vm.courseSession.confusionThreshold);
                toastr.success("Confusion Threshold Set to " + vm.courseSession.confusionThreshold);
              },
              responseFail => {console.log("Server error, couldn't set threshold")});

        }
        else{
          toastr.error("Confusion Threshold Must Be a Valid Number Between 0 & 100")
          vm.confusionThresholdSelectedValue = vm.courseSession.confusionThreshold;
        }
      }
    }

    /*
     Interval Function To Check Connection Status
     */
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

    }, 5000);


  }




})();
