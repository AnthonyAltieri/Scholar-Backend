'use strict';

/** Author: Anthony Altieri **/

(function () {
  angular.module('app', ['ui.router', 'nvd3']).run(function ($http, $rootScope) {
    $http.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

    $rootScope.ENV = ENV;

    switch ($rootScope.ENV) {
      case "DEVELOPMENT":
        $rootScope.socket = io.connect('http://localhost:8000');
        break;

      case "PRODUCTION":
        $rootScope.socket = io.connect('http://scholarapp.xyz');
        break;
    }

    $rootScope.socket.on('connect', function () {
      $rootScope.isSocketConnected = true;
      $rootScope.$broadcast('SOCKET_CONNECT', {});
    });
    $rootScope.socket.on('disconnect', function () {
      $rootScope.isSocketConnected = false;
      $rootScope.$broadcast('SOCKET_DISCONNECT', {});
    });

    $rootScope.loading = true;

    // Toast Options
    toastr.options.positionClass = 'toast-bottom-full-width';
    toastr.options.showDuration = 500;
    toastr.options.hideDuration = 500;
    toastr.options.timeOut = 3000;
  }).config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {

    $httpProvider.defaults.withCredentials = true;

    var launch = {
      name: 'launch',
      url: '/launch',
      templateUrl: '/static/templates/launch.html',
      abstract: true
    };

    var launchLogIn = {
      name: 'launch.login',
      parent: 'launch',
      url: '/login',
      templateUrl: '/static/templates/launch.login.html',
      controller: 'LoginController',
      controllerAs: 'vm'
    };

    var dashConfusion = {
      name: 'dash.confusion',
      url: '/confusion',
      templateUrl: '/static/templates/popup.confusion.html',
      controller: 'ConfusionPopUpController',
      controllerAs: 'popup'
    };

    var dashMCQ = {
      name: 'dash.mcq',
      url: '/mcq',
      templateUrl: '/static/templates/popup.mcq.html',
      controller: 'MCQPopUpController',
      controllerAs: 'popMCQ'
    };

    var launchSignUp = {
      name: 'launch.signup',
      parent: 'launch',
      url: '/signup',
      templateUrl: '/static/templates/launch.signup.html',
      controller: 'SignUpController',
      controllerAs: 'vm'
    };

    var dash = {
      name: 'dash',
      url: '/dash',
      abstract: true,
      templateUrl: '/static/templates/dash.html'
    };

    var dashCourses = {
      name: 'dash.courses',
      parent: 'dash',
      url: '/courses',
      templateUrl: '/static/templates/dash.courses.html',
      controller: 'DashCoursesController',
      controllerAs: 'dash'
    };

    var dashAdmin = {
      name: 'dash.admin',
      url: '/admin',
      templateUrl: '/static/templates/admin.create.instructor.account.html',
      controller: 'AdminCreateInstructorController',
      controllerAs: 'admin'
    };

    var dashCoursesActive = {
      name: 'dash.courses.active',
      parent: 'dash.courses',
      url: '/active',
      templateUrl: '/static/templates/dash.courses.active.html',
      controllerAs: 'courses'
    };

    var dashCoursesInactive = {
      name: 'dash.courses.inactive',
      parent: 'dash.courses',
      url: '/inactive',
      templateUrl: '/static/templates/dash.courses.inactive.html',
      controllerAs: 'courses'
    };

    var dashStudent = {
      name: 'dash.student',
      parent: 'dash',
      url: '/student',
      params: {
        data: null
      },
      views: {
        '': {
          templateUrl: '/static/templates/dash.student.html',
          controller: 'DashStudentController',
          controllerAs: 'dash'
        },
        'questions@dash.student': {
          templateUrl: '/static/templates/dash.student.questions.html',
          controller: 'StudentQuestionListController',
          controllerAs: 'questions'
        },
        'ask@dash.student': {
          templateUrl: '/static/templates/dash.student.ask.html'
        },
        'reflective@dash.student': {
          templateUrl: '/static/templates/dash.student.reflective.html'
        },
        'instant@dash.student': {
          templateUrl: '/static/templates/dash.student.instant.html'
        }
      }
    };

    var dashInstructor = {
      name: 'dash.instructor',
      parent: 'dash',
      url: '/instructor',
      params: {
        data: null
      },
      views: {
        '': {
          templateUrl: '/static/templates/dash.instructor.html',
          controller: 'DashInstructorController',
          controllerAs: 'dash'
        },
        'homeStatistics@dash.instructor': {
          templateUrl: '/static/templates/dash.instructor.home.statistics.html'
        },
        'homeConfusion@dash.instructor': {
          templateUrl: '/static/templates/dash.instructor.home.confusion.html'
        },
        'homeQuestions@dash.instructor': {
          templateUrl: '/static/templates/dash.instructor.home.questions.html',
          controller: 'InstructorQuestionListController',
          controllerAs: 'questions'
        },
        'assessmentPropose@dash.instructor': {
          templateUrl: '/static/templates/dash.instructor.assessment.propose.html',
          controller: 'InstructorAssessmentProposeController',
          controllerAs: 'propose'
        },
        'assessmentStatistics@dash.instructor': {
          templateUrl: '/static/templates/dash.instructor.assessment.statistics.html',
          controller: 'InstructorAssessmentStatisticsController',
          controllerAs: 'stats'
        },
        'assessmentAnswers@dash.instructor': {
          templateUrl: '/static/templates/dash.instructor.assessment.answers.html'
        }
      }
    };

    $stateProvider.state('splash', {
      url: '/splash',
      templateUrl: '/static/templates/splashpage.html',
      controller: 'SplashController'
    }).state(launch).state(launchLogIn).state(launchSignUp).state(dash).state(dashCourses).state(dashCoursesActive).state(dashCoursesInactive).state(dashStudent).state(dashInstructor).state(dashAdmin).state(dashConfusion).state(dashMCQ);

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/splash');
    $locationProvider.html5Mode(true);
  }).directive('myEnter', function () {
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if (event.which === 13) {

          scope.$apply(function () {
            scope.$eval(attrs.myEnter);
          });

          event.preventDefault();
        }
      });
    };
  });
})();
'use strict';

var ENV = 'DEVELOPMENT';
'use strict';

function readLocalStorage(name) {
    return JSON.parse(localStorage.getItem(name));
}

function writeLocalStorage(name, value) {
    localStorage.setItem(name, JSON.stringify(value));
}
'use strict';
// Create cookie

function createCookie(name, value, hours) {
  var expires;
  if (hours) {
    var date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);
    expires = "; expires=" + date.toGMTString();
  } else {
    expires = "";
  }
  document.cookie = name + "=" + JSON.stringify(value) + expires + "; path=/";
}

// Read cookie
function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(c.substring(nameEQ.length, c.length));
      } catch (err) {
        return c.substring(nameEQ.length, c.length);
      }
    }
  }
  return null;
}

// Erase cookie
function eraseCookie(name) {
  createCookie(name, "", -1);
}
'use strict';

/**
 * Created by bharatbatra on 9/16/16.
 */
/** Author: Anthony Altieri **/

(function () {
    'use strict';

    angular.module('app').controller('AdminCreateInstructorController', AdminCreateInstructorController);

    AdminCreateInstructorController.$inject = ['$rootScope', '$state', 'ServerService', 'UserRoutes', 'UserService'];

    function AdminCreateInstructorController($rootScope, $state, ServerService, UserRoutes, UserService) {
        var vm = this;

        vm.showInfo = false;
        vm.user = {};
        vm.course = {};

        $rootScope.loading = false;

        vm.signingUp = false;

        vm.goBack = goBack;
        vm.createInstructorAccount = createInstructorAccount;

        function goBack() {
            $state.go('launch.login');
        }

        function createInstructorAccount(input) {
            console.log("Before input");
            console.log(JSON.stringify(input, null, 2));
            vm.signingUp = true;

            var email = input.email.trim().toLocaleLowerCase();
            var password = input.password;
            var firstName = input.firstName;
            var lastName = input.lastName;
            var courseCode = input.courseCode;
            var courseTitle = input.courseTitle;
            var time = input.time;

            UserService.createInstructorAccount(email, password, firstName, lastName, courseCode, courseTitle, time, function (user, course) {
                vm.signingUp = false;
                if (user && course) {
                    vm.user = user;
                    vm.course = course;
                    vm.showInfo = true;
                }
            });
        }
    }
})();
'use strict';

/**
 * Created by bharatbatra on 9/28/16.
 */
/** Author: Anthony Altieri **/

(function () {
    'use strict';

    angular.module('app').controller('ConfusionPopUpController', ConfusionPopUpController);

    ConfusionPopUpController.$inject = ['$rootScope', '$scope', '$log', '$state', '$stateParams', '$interval', 'ServerService', 'ReflectiveAssessmentRoutes', 'SocketService', 'SocketRoutes', 'CourseSessionRoutes', 'CourseRoutes', 'CourseSessionService'];

    function ConfusionPopUpController($rootScope, $scope, $log, $state, $stateParams, $interval, ServerService, ReflectiveAssessmentRoutes, SocketService, SocketRoutes, CourseSessionRoutes, CourseRoutes, CourseSessionService) {

        $rootScope.loading = false;

        var vm = this;
        vm.courseSession = {};

        var stateParams = readLocalStorage("stateParams");
        var intervalPromises = [];

        //Setup
        if (stateParams) {
            init(vm, stateParams);
            //writeLocalStorage("sessionId", -1);
        } else {
            console.log("Error. no init variables");
        }

        //Overlay to confirm end session
        vm.showEndSessionOverlay = false;

        // Sockets
        // handleSockets(SocketService, vm.courseSession.id);

        function init(vm, stateParams) {
            writeLocalStorage("stateParams", stateParams);
            var _stateParams$data = stateParams.data;
            var courseSessionId = _stateParams$data.courseSessionId;
            var code = _stateParams$data.code;
            var courseId = _stateParams$data.courseId;
            var instructorName = _stateParams$data.instructorName;

            initCourseSession(vm, courseSessionId, code, courseId);
            getAttendance(courseSessionId).then(function (attendance) {
                vm.courseSession.attendance = attendance;
            });
            ServerService.p(CourseSessionRoutes.ALERTS_GET_NUMBER_ACTIVE, {}).then(function (data) {
                var success = data.success;
                var activeAlerts = data.activeAlerts;

                if (success) {
                    vm.courseSession.activeAlerts = activeAlerts;
                }
            }).catch(function (error) {});
            vm.instructorName = instructorName;
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
                courseId: courseId,
                code: code,
                isRAActive: false,
                activeAlerts: 0,
                confusionThreshold: readLocalStorage(courseSessionId + "-confusionThreshold"),
                recentDiscussionAnswers: []
            };
        }

        function getAttendance(courseSessionId) {
            return new Promise(function (resolve, reject) {
                ServerService.post(CourseSessionRoutes.ATTENDANCE_GET, { courseSessionId: courseSessionId
                }, function (resSuccess) {
                    var data = resSuccess.data;
                    var success = data.success;
                    var attendance = data.attendance;


                    if (success) {
                        resolve(attendance);
                        return;
                    }

                    reject(null);
                }, function (resFail) {
                    console.log("failed miserably");
                });
            });
        }
        /*
         Angular-nvd3 Bar Graph Setup
         */
        /*
         Confusion Line Graph Initialization
         */

        //Constants for time math regarding confusion line
        //We want to show only last 10 minutes of confusion data
        var INTERVAL_TIME = 3000; //1 request every 3 seconds
        var TOTAL_MINUTES = 10; //the amount we want to show the professor
        var TOTAL_TIME = TOTAL_MINUTES * 60000; //milliseconds
        var NUM_DATAPOINTS = TOTAL_TIME / INTERVAL_TIME;
        var STEP_SIZE = Number((TOTAL_MINUTES / NUM_DATAPOINTS).toFixed(2));

        //Cookie for confusion graph Data to be saved with name courseSessionId-confusion
        var confusionGraph = readLocalStorage(vm.courseSession.id + "-confusionData");

        //Cookie doesn't exist, must initialize it
        if (!confusionGraph) {
            console.log("no LS for graph found making new graph");

            vm.confusionGraph = {};
            vm.confusionGraph.options = {
                chart: {
                    type: 'lineChart',
                    height: 260,
                    yDomain: [0, 100],
                    x: function x(d) {
                        return d.x;
                    },
                    y: function y(d) {
                        return d.y;
                    },
                    useInteractiveGuideline: true,
                    dispatch: {
                        stateChange: function stateChange(e) {},
                        changeState: function changeState(e) {},
                        tooltipShow: function tooltipShow(e) {},
                        tooltipHide: function tooltipHide(e) {}
                    },
                    yAxis: {
                        axisLabel: 'Percentage of Students',
                        axisLabelDistance: -10
                    },
                    xAxis: {
                        axisLabel: 'Time (minutes)'
                    },
                    callback: function callback(chart) {}
                }
            };
            //Will be used to store all the confusion values. To Be Used Later for Zoomout onDblClick
            var confusionValues = [];
            var threshValues = [];

            //Initialize data points with confusion value 0
            for (var i = 0; i <= NUM_DATAPOINTS; i++) {
                confusionValues.push({ x: Number((-1 * TOTAL_MINUTES + i * STEP_SIZE).toFixed(2)), y: 0 });
                threshValues.push({ x: Number((-1 * TOTAL_MINUTES + i * STEP_SIZE).toFixed(2)), y: vm.courseSession.confusionThreshold });
            }

            vm.confusionGraph.data = [{
                values: confusionValues,
                key: 'Live Confusion',
                color: '#7777ff',
                area: true
            }, {
                values: threshValues,
                key: 'Confusion Threshold',
                color: '#42AFAC'
            }];

            //cookie valid for 'CONFUSION_COOKIE_VALIDITY' hours and has name = courseSessionID
            writeLocalStorage(vm.courseSession.id + "-confusionData", vm.confusionGraph);
        } else {
            console.log("found the LS for confusionGraph");
            vm.confusionGraph = confusionGraph;
        }

        // Update the clock every minute
        var promiseTime = $interval(function () {
            vm.confusionGraph = readLocalStorage(vm.courseSession.id + "-confusionData");
            // $scope.$apply();
        }, 1000);
        intervalPromises.push(promiseTime);

        $scope.$on('$destroy', function () {
            intervalPromises.forEach(function (p) {
                $interval.cancel(p);
            });
        });
    }
})();
'use strict';

/** @Author: Anthony Altieri **/

(function () {
  angular.module('app').controller('DashCoursesController', DashCoursesController);

  DashCoursesController.$inject = ['$scope', '$rootScope', '$log', '$interval', '$state', 'ServerService', 'SocketService', 'CourseRoutes', 'UserRoutes', 'CourseService', 'UserService', 'CourseSessionService'];

  function DashCoursesController($scope, $rootScope, $log, $interval, $state, ServerService, SocketService, CourseRoutes, UserRoutes, CourseService, UserService, CourseSessionService) {
    var vm = this;

    ServerService.checkForValidSession();

    //In case the user had been redirected from a course registration link, we will register now
    CourseService.handleCourseRegistration();

    // By Default Active classes are shown
    vm.tabSelected = 'ACTIVE';

    vm.user = {};

    UserService.getUserInformation().then(function (data) {
      var name = data.name;
      var type = data.type;

      vm.user.name = name;
      vm.user.type = type;
    });

    vm.courses = {
      active: [],
      inactive: []
    };

    $rootScope.loading = false;

    var intervalPromises = [];

    /** Function **/

    vm.chooseClass = chooseClass;
    vm.logOut = logOut;
    vm.clickActive = clickActive;
    vm.clickInactive = clickInactive;

    /** Function Implementation **/

    function chooseClass(chosenClass) {
      switch (vm.user.type) {
        case 'INSTRUCTOR':
          CourseService.activateOrJoinCourseSession(vm.user.id, chosenClass._id);
          break;
        case 'STUDENT':
          CourseService.joinCourseSession(chosenClass._id);
          break;
      }
    }

    function logOut() {
      UserService.logOut();
    }

    CourseService.getEnrolledCourses(function (active, inactive) {
      vm.courses.active = active;
      vm.courses.inactive = inactive;
    });

    // CourseService.getEnrolledCourses((active, inactive) => {
    //   vm.courses.active = active;
    //   vm.courses.inactive = inactive;
    // });


    function clickActive() {
      vm.tabSelected = 'ACTIVE';
    }

    function clickInactive() {
      vm.tabSelected = 'INACTIVE';
    }

    if ($rootScope.priorCourseSessionId) {
      CourseSessionService.removeStudentFromAll();
      $rootScope.priorCourseSessionId = null;
    }

    var promiseCourseGet = $interval(function () {
      CourseService.getEnrolledCourses(function (active, inactive) {
        vm.courses.active = active;
        vm.courses.inactive = inactive;
      });
    }, 5000);
    intervalPromises.push(promiseCourseGet);

    $scope.$on('$destroy', function () {
      $interval.cancel(promiseCourseGet);
    });
  }
})();
'use strict';

/** Author: Anthony Altieri **/

(function () {
  'use strict';

  angular.module('app').controller('DashInstructorController', DashInstructorController);

  DashInstructorController.$inject = ['$rootScope', '$scope', '$log', '$state', '$stateParams', '$interval', 'ServerService', 'ReflectiveAssessmentRoutes', 'SocketService', 'SocketRoutes', 'CourseSessionRoutes', 'CourseRoutes', 'CourseSessionService', 'InstantAssessmentService'];

  function DashInstructorController($rootScope, $scope, $log, $state, $stateParams, $interval, ServerService, ReflectiveAssessmentRoutes, SocketService, SocketRoutes, CourseSessionRoutes, CourseRoutes, CourseSessionService, InstantAssessmentService) {

    //Number of hours for which the confusion data is saved on client - currently this is just the last 10 mins of data
    var CONFUSION_COOKIE_VALIDITY = 3;

    var vm = this;

    if (!$stateParams.data) {
      $state.go('launch.login');
      return;
    }

    init(vm, $stateParams);

    vm.numberQuestions = 0;

    var intervalPromises = [];

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
    vm.confusionThresholdSelectedValue; //we set this equal to default confusion threshold for the session
    vm.setThreshold = setThreshold;

    // Sockets
    handleSockets(SocketService, vm.courseSession.id);

    function init(vm, $stateParams) {
      writeLocalStorage("stateParams", $stateParams);
      var _$stateParams$data = $stateParams.data;
      var courseSessionId = _$stateParams$data.courseSessionId;
      var code = _$stateParams$data.code;
      var courseId = _$stateParams$data.courseId;
      var instructorName = _$stateParams$data.instructorName;
      var confusionThreshold = _$stateParams$data.confusionThreshold;

      initInput(vm);
      initCourseSession(vm, courseSessionId, code, courseId, confusionThreshold);
      getAttendance().then(function (attendance) {
        vm.courseSession.attendance = attendance;
      });
      goTabHome(vm);
      generateAssessmentObjects(vm);
      ServerService.p(CourseSessionRoutes.ALERTS_GET_NUMBER_ACTIVE, {}).then(function (data) {
        var success = data.success;
        var activeAlerts = data.activeAlerts;

        if (success) {
          vm.courseSession.activeAlerts = activeAlerts;
        }
      }).catch(function (error) {});
      vm.instructorName = instructorName;
    }

    $scope.$on('QUESTION_LIST_INIT', function (event, data) {
      $scope.$broadcast('COURSESESSION_JOINED_QUESTION', {
        courseSessionId: vm.courseSession.id
      });
    });

    $scope.$on('ASSESSMENT_INIT', function (event, data) {
      $scope.$broadcast('COURSESESSION_JOINED', {
        courseSessionId: vm.courseSession.id
      });
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
        width: 650, //TODO: FIGURE OUT HOW TO MAKE THESE RESPONSIVE
        yDomain: [0, 100],
        x: function x(d) {
          return d.label;
        },
        y: function y(d) {
          return d.value;
        },
        showValues: true,
        duration: 500,
        xAxis: {
          axisLabel: 'Options'
        },
        yAxis: {
          axisLabel: '% of students',
          axisLabelDistance: -10
        },
        callback: function callback(chart) {
          d3.selectAll("rect").on('click', function (e, i, nodes) {
            console.log(JSON.stringify(i, null, 2));
            /*
             Experimentally observed index conversion
             */
            var correctIndex = i - 4;
            if (correctIndex >= 0 && correctIndex < 5) {
              if (vm.selectedAssessment === 'INSTANT') {
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
    vm.instantAssessmentGraph.data = [{
      key: "first attempt",
      values: [{
        "label": "A",
        "value": 0
      }, {
        "label": "B",
        "value": 0
      }, {
        "label": "C",
        "value": 0
      }, {
        "label": "D",
        "value": 0
      }, {
        "label": "E",
        "value": 0
      }]
    }];

    /*
    Confusion Line Graph Initialization
     */

    //Constants for time math regarding confusion line
    //We want to show only last 10 minutes of confusion data
    var INTERVAL_TIME = 3000; //1 request every 3 seconds
    var TOTAL_MINUTES = 10; //the amount we want to show the professor
    var TOTAL_TIME = TOTAL_MINUTES * 60000; //milliseconds
    var NUM_DATAPOINTS = TOTAL_TIME / INTERVAL_TIME;
    var STEP_SIZE = Number((TOTAL_MINUTES / NUM_DATAPOINTS).toFixed(2));
    //Cookie for confusion graph Data to be saved with name courseSessionId-confusion
    var confusionGraph = readLocalStorage(vm.courseSession.id + "-confusionData");

    //Cookie doesn't exist, must initialize it
    if (!confusionGraph) {

      vm.confusionGraph = {};
      vm.confusionGraph.options = {
        chart: {
          type: 'lineChart',
          height: 260,
          yDomain: [0, 100],
          x: function x(d) {
            return d.x;
          },
          y: function y(d) {
            return d.y;
          },
          useInteractiveGuideline: true,
          dispatch: {
            stateChange: function stateChange(e) {},
            changeState: function changeState(e) {},
            tooltipShow: function tooltipShow(e) {},
            tooltipHide: function tooltipHide(e) {}
          },
          yAxis: {
            axisLabel: 'Percentage of Students',
            axisLabelDistance: -10
          },
          xAxis: {
            axisLabel: 'Time (minutes)'
          },
          callback: function callback(chart) {}
        }
      };
      //Will be used to store all the confusion values. To Be Used Later for Zoomout onDblClick
      var confusionValues = [];
      var threshValues = [];

      //Initialize data points with confusion value 0
      for (var i = 0; i <= NUM_DATAPOINTS; i++) {
        confusionValues.push({ x: Number((-1 * TOTAL_MINUTES + i * STEP_SIZE).toFixed(2)), y: 0 });
        threshValues.push({ x: Number((-1 * TOTAL_MINUTES + i * STEP_SIZE).toFixed(2)), y: vm.courseSession.confusionThreshold });
      }

      vm.confusionGraph.data = [{
        values: confusionValues,
        key: 'Live Confusion',
        color: '#7777ff',
        area: true
      }, {
        values: threshValues,
        key: 'Confusion Threshold',
        color: '#42AFAC'
      }];

      //cookie valid for 'CONFUSION_COOKIE_VALIDITY' hours and has name = courseSessionID
      writeLocalStorage(vm.courseSession.id + "-confusionData", vm.confusionGraph);
    } else {
      vm.confusionGraph = confusionGraph;
    }

    // Update the clock every minute
    vm.time = new Date();
    var promiseTime = $interval(function () {
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
          activateReflectiveAssessment(vm.courseSession.id, vm.input.propose);
          break;

        case 'INSTANT':
          if (vm.instantAssessment.options.length >= 1 && vm.instantAssessment.options.length < 2) {
            toaster.error('If you are entering answers you must have at least 2.');
            return;
          }
          activateInstantAssessment(vm.courseSession.id, vm.input.propose, vm.instantAssessment.options);
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
        courseSessionId: courseSessionId,
        questionContent: questionContent
      }, function (responseSuccess) {
        var data = responseSuccess.data;
        var success = data.success;
        var id = data.id;


        if (success) {
          initActiveAssessment('REFLECTIVE', id, vm.reflectiveAsssessment);

          vm.input.propose = '';

          toastr.success("Reflective Assessment", "Watch the live-data from the class");
        }
      });
    }

    function activateInstantAssessment(courseSessionId, content, options) {
      ServerService.post(InstantAssessmentRoutes.CREATE, {
        courseSessionId: courseSessionId, content: content, options: options
      }, function (responseSuccess) {
        var data = responseSuccess.data;
        var success = data.success;
        var instantAssessmentId = data.instantAssessmentId;


        if (success) {
          initActiveAssessment('INSTANT', instantAssessmentId, vm.instantAssessment);

          vm.input.propose = '';

          toastr.success('Instant Assessment Started', 'Watch the live-data from the class');
        }
      }, function (responseFail) {});
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
        content: content,
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
        id: id,
        type: 'REFLECTIVE',
        question: reflectiveAssessment.question,
        numberAnswered: reflectiveAssessment.responses ? reflectiveAssessment.responses.length : 0,
        percentAnswered: reflectiveAssessment.responses ? reflectiveAssessment.responses.length / attendance : 0,
        numberReviewed: reflectiveAssessment.responses ? reflectiveAssessment.responses.filter(function (r) {
          return r.votes.length > 0;
        }).length || 0 : 0
      };
    }

    function initInstantAssessment(instantAssessment, id, attendance) {
      var array = [];
      return {
        id: id,
        type: 'INSTANT',
        options: instantAssessment.options ? instantAssessment.options.forEach(function (o) {
          array.push(o);
        }) : ['', '', '', ''],
        numberAnswered: instantAssessment.answers ? instantAssessment.answers.length : 0,
        percentAnswered: instantAssessment.answers ? Math.floor(instantAssessment.answers.length / attendance) + '%' : '0%'
      };
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
      };
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
      };
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

      var hasWordTooLong = false;

      content.split(' ').forEach(function (w) {
        if (w.length >= 24) {
          hasWordTooLong = true;
        }
      });

      if (hasWordTooLong) {
        toastr.info('Cannot have a word that is longer than 24 characters ' + 'please re-write your answer');
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
        courseId: courseId,
        code: code,
        attendance: 0,
        isRAActive: false,
        activeAlerts: 0,
        confusionThreshold: confusionThreshold,
        recentDiscussionAnswers: []
      };
      vm.confusionThresholdSelectedValue = vm.courseSession.confusionThreshold;
      writeLocalStorage(vm.courseSession.id + "-confusionThreshold", vm.courseSession.confusionThreshold);
      CourseSessionService.getAttendance(courseSessionId).then(function (data) {
        var attendance = data.attendance;

        vm.courseSession.attendance = attendance || 0;
        $scope.$broadcast('STUDENT_JOINED', { attendance: attendance });
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
      };
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
      }, function (responseSuccess) {
        var data = responseSuccess.data;
        var success = data.success;

        if (!success) {
          toastr.error('Server Error Please Try Again!');
        } else {
          vm.courseSession.questions = vm.courseSession.questions.filter(function (q) {
            return q._id.toString() !== question._id.toString();
          });
        }
      }, function (responseFail) {});
    }

    /**
     * Begins a new Reflective Assessment with a question that has been asked by a student
     *
     * @param question {object} - The question that is going to be used as a newly created Reflective
     * Assessment
     * @param question.content {string} - The string that is the actual content of the question
     */
    function useForReflectiveAssessment(question) {
      activateReflectiveAssessment(vm.courseSession.id, question);
    }

    function getAttendance(courseSessionId) {
      return new Promise(function (resolve, reject) {
        ServerService.post(CourseSessionRoutes.ATTENDANCE_GET, { courseSessionId: courseSessionId
        }, function (resSuccess) {
          var data = resSuccess.data;
          var success = data.success;
          var attendance = data.attendance;


          if (success) {
            resolve(attendance);
            return;
          }

          reject(null);
        }, function (resFail) {});
      });
    }

    /**
     * Ends a Course Session and notifies the Student's that the Course Session has ended, this
     * will make the current Course Session inactive so students can't join it again
     */
    function endCourseSession() {
      ServerService.post(CourseRoutes.COURSESESSION_ACTIVE_END, {
        courseId: vm.courseSession.courseId
      }, function (responseSuccess) {
        var data = responseSuccess.data;
        var success = data.success;


        if (success) {
          vm.courseSession.active = false;
          toastr.success('Successfully ended Course Session');
        }
      }, function (responseFail) {});
      vm.showEndSessionOverlay = false;
    }

    var promiseGetAlertsInWindow = $interval(function () {
      ServerService.post(CourseSessionRoutes.ALERTS_GET_NUMBER_ACTIVE, {
        courseSessionId: vm.courseSession.id
      }, function (responseSuccess) {
        var data = responseSuccess.data;
        var success = data.success;
        var activeAlerts = data.activeAlerts;

        if (success) {
          vm.courseSession.activeAlerts = activeAlerts;

          if (vm.courseSession.activeAlerts / vm.courseSession.attendance * 100 >= vm.courseSession.confusionThreshold) {
            vm.confusionGraph.data[0].color = '#FC539C';
          } else {
            vm.confusionGraph.data[0].color = '#7777ff';
          }

          var str = " STR ";

          var _i = 0;

          //for each of the series
          for (_i; _i < vm.confusionGraph.data.length; _i++) {
            vm.confusionGraph.data[_i].values = vm.confusionGraph.data[_i].values.splice(1, vm.confusionGraph.data[_i].values.length - 1);
            vm.confusionGraph.data[_i].values.forEach(function (val) {
              val.x = Number((val.x - STEP_SIZE).toFixed(2));
              str += val.x + " ; ";
            });
          }

          var mostRecentConfusionPercentage = vm.courseSession.activeAlerts / vm.courseSession.attendance * 100;
          var mostRecentConfusionThreshold = vm.courseSession.confusionThreshold;

          /*
          Accounting for NUll Value Bugs
           */
          if (!mostRecentConfusionPercentage) {
            mostRecentConfusionPercentage = 0;
          }
          if (!mostRecentConfusionThreshold) {
            mostRecentConfusionThreshold = 0;
          }
          vm.confusionGraph.data[0].values.push({ x: 0, y: mostRecentConfusionPercentage, series: 0 });
          vm.confusionGraph.data[1].values.push({ x: 0, y: mostRecentConfusionThreshold, series: 1 });
          writeLocalStorage(vm.courseSession.id + "-confusionData", vm.confusionGraph);
        }
      }, function (responseFail) {});
    }, INTERVAL_TIME); //set at every 15 sec.
    intervalPromises.push(promiseGetAlertsInWindow);

    $rootScope.$on('STUDENT_JOINED', function (event, data) {
      var attendance = data.attendance;

      $scope.$broadcast('STUDENT_JOINED', { attendance: attendance });
      vm.courseSession.attendance = data.attendance;
    });

    var ROUTE_STUDENT_LEFT = SocketRoutes.STUDENT_LEFT + ':' + vm.courseSession.id;
    $rootScope.$on(ROUTE_STUDENT_LEFT, function (event, data) {
      var attendance = data.attendance;

      $scope.$broadcast('STUDENT_LEFT', { attendance: attendance });
      vm.courseSession.attendance = data.attendance;
    });

    $scope.$on('ALERT_ADDED', function (event, data) {
      vm.courseSession.activeAlerts = data.currentAlerts;
      $scope.$apply();
    });

    $rootScope.$on('INSTANT_ASSESSMENT_SELECTION', function (event, data) {
      vm.showInstantAssessmentGraph = true;
      var answerObject = data.answerObject;

      var numberAnswersRecieved = answerObject['A'] + answerObject['B'] + answerObject['C'] + answerObject['D'] + answerObject['E'];
      vm.instantAssessmentGraph.data[0].values[0].value = answerObject['A'] / numberAnswersRecieved * 100;
      vm.instantAssessmentGraph.data[0].values[1].value = answerObject['B'] / numberAnswersRecieved * 100;
      vm.instantAssessmentGraph.data[0].values[2].value = answerObject['C'] / numberAnswersRecieved * 100;
      vm.instantAssessmentGraph.data[0].values[3].value = answerObject['D'] / numberAnswersRecieved * 100;
      vm.instantAssessmentGraph.data[0].values[4].value = answerObject['E'] / numberAnswersRecieved * 100;

      console.log(vm.courseSession.id);
      console.log(vm.instantAssessmentGraph);
      writeLocalStorage(vm.courseSession.id + "-mcqData", vm.instantAssessmentGraph.data);
      $scope.$apply();
    });

    var ROUTE_RESPONSE_RECEIVED = SocketRoutes.REFLECTIVE_ASSESSMENT_RESPONSE_RECEIVED + ':' + vm.courseSession.id;
    $rootScope.$on(ROUTE_RESPONSE_RECEIVED, function (event, data) {
      $scope.$broadcast('REFLECTIVE_RESPONSE_RECEIVED', data);
      $scope.$apply();
    });

    var ROUTE_RESPONSE_REVIEWED = SocketRoutes.FR_RESPONSE_REVIEWED + ':' + vm.courseSession.id;
    $rootScope.$on(ROUTE_RESPONSE_REVIEWED, function (event, data) {
      vm.activeAssessment.numberReviewed = data.numberResponsesReviewed;
      $scope.$apply();
    });

    $scope.$on('QUESTIONS_USE_FOR_ASSESSMENT', function (event, data) {
      $scope.$broadcast('QUESTIONS_USE_FOR_ASSESSMENT', data);
    });

    $scope.$on('QUESTIONS_USE_FOR_ASSESSMENT', function (event, data) {
      var content = data.content;

      $scope.$broadcast('QUESTIONS_USE_FOR_ASSESSMENT', {
        content: content,
        courseSessionId: vm.courseSession.id
      });
    });

    $scope.$on('ALERT_ADDED', function (event, data) {
      var currentAlerts = data.currentAlerts;

      vm.courseSession.activeAlerts = currentAlerts;
    });

    $scope.$on('TAB_SELECTED', function (event, data) {
      var tab = data.tab;

      if (vm.tabSelected === tab) return;
      vm.tabSelected = tab;
    });

    $scope.$on('ASSESSMENT_ACTIVATED', function (event, data) {
      vm.activeAssessmentId = data.activeAssessmentId;
      writeLocalStorage(vm.courseSession.id + "-activeAssessmentId", data.activeAssessmentId);
      vm.showInstantAssessmentGraph = false;
    });

    $scope.$on('QUESTION_NUMBER', function (event, data) {
      var number = data.number;

      vm.numberQuestions = number;
      $scope.$apply();
    });

    $scope.$on('$destroy', function () {
      intervalPromises.forEach(function (p) {
        $interval.cancel(p);
      });
    });

    /*
    Function to reset the confusion threshold
     */
    function setThreshold() {
      if (isNaN(vm.confusionThresholdSelectedValue) || !vm.confusionThresholdSelectedValue) {
        toastr.error("Confusion Threshold Must Be a Valid Number Between 0 & 100");
        vm.confusionThresholdSelectedValue = vm.courseSession.confusionThreshold;
      } else {
        if (vm.confusionThresholdSelectedValue >= 0 && vm.confusionThresholdSelectedValue <= 100) {
          ServerService.post(CourseSessionRoutes.ALERTS_SET_THRESHOLD, {
            courseSessionId: vm.courseSession.id,
            threshold: vm.confusionThresholdSelectedValue
          }, function (responseSuccess) {
            vm.courseSession.confusionThreshold = vm.confusionThresholdSelectedValue;
            writeLocalStorage(vm.courseSession.id + "-confusionThreshold", vm.courseSession.confusionThreshold);
            toastr.success("Confusion Threshold Set to " + vm.courseSession.confusionThreshold);
          }, function (responseFail) {
            console.log("Server error, couldn't set threshold");
          });
        } else {
          toastr.error("Confusion Threshold Must Be a Valid Number Between 0 & 100");
          vm.confusionThresholdSelectedValue = vm.courseSession.confusionThreshold;
        }
      }
    }

    /*
     Interval Function To Check Connection Status
     */
    var checkConnection = $interval(function () {
      if (!window.navigator) {
        vm.connectionStatus = "unknown";
      } else {
        var socketStatus = $rootScope.socket.connected;
        var networkStatus = window.navigator.onLine;

        if (!socketStatus && !networkStatus) {
          vm.connectionStatus = "disconnected";
        } else if (!socketStatus && networkStatus || socketStatus && !networkStatus) {
          vm.connectionStatus = "unstable";
        } else {
          vm.connectionStatus = "connected";
        }
      }
    }, 5000);
  }
})();
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/** Author: Anthony Altieri **/

(function () {
  'use strict';

  angular.module('app').controller('DashStudentController', DashStudentController);

  DashStudentController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', 'SocketService', 'ServerService', 'SocketRoutes', 'VoteType', 'ReflectiveAssessmentRoutes', 'CourseSessionRoutes', 'InstantAssessmentService', 'CourseSessionService', '$timeout', 'UserService', '$interval', 'QuestionListService'];

  function DashStudentController($rootScope, $scope, $state, $stateParams, SocketService, ServerService, SocketRoutes, VoteType, ReflectiveAssessmentRoutes, CourseSessionRoutes, InstantAssessmentService, CourseSessionService, $timeout, UserService, $interval, QuestionListService) {
    var vm = this;
    vm.questionList = {};

    determineIfHasValidSession($stateParams);
    initCourseSession($stateParams);
    initUIFlags(vm);
    initInput(vm);

    var intervals = [];

    $scope.$on('QUESTION_LIST_INIT', function (event, data) {
      UserService.getId().then(function (data) {
        var userId = data.userId;

        $scope.$broadcast('INIT_QUESTION_LIST', {
          userId: userId,
          courseSessionId: vm.courseSession.id
        });
        vm.userId = userId;
      });
    });

    $scope.$on('QUESTION_LIST_AVAILABLE', function (event, data) {
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
      }, function (resSuccess) {
        var data = resSuccess.data;
        var success = data.success;


        if (success) {
          toastr.info('Leaving Course Session and going to your course list');
          $rootScope.votedOn = vm.votedOn;
          $rootScope.lastCourse = vm.courseSession.classCode;
          $rootScope.priorCourseSessionId = vm.courseSession.id;

          $state.go('dash.courses.active');
        }
      }, function (resFail) {});
    }

    function timeFromNow(dateString) {
      return moment(dateString).fromNow();
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
      var content = vm.input.response;
      if (content.trim().length === 0) {
        toastr.info('You need content in a response to a Reflective Assessment quesiton!');
        return;
      }

      ServerService.post(ReflectiveAssessmentRoutes.RESPOND, {
        content: content,
        reflectiveAssessmentId: vm.sticky.id,
        courseSessionId: vm.courseSession.id
      }, function (responseSuccess) {
        var data = responseSuccess.data;
        var success = data.success;
        var responses = data.responses;
        var id = data.id;


        if (success) {
          vm.responding = false;
          vm.reviewing = true;
          // vm.sticky.responses = responses;
          // vm.sticky.visibleResponses = responses.filter(getVisibleResponses);
          vm.input.response = '';
        }
      }, function (responseFail) {});
    }

    function voteOnResponse(response, type) {
      ServerService.p(ReflectiveAssessmentRoutes.VOTE_ON_RESPONSE, {
        courseSessionId: vm.courseSession.id,
        reflectiveAssessmentId: vm.sticky.id,
        voteType: type,
        responseId: response._id
      }).then(function (data) {
        vm.sticky.visibleResponses = vm.sticky.visibleResponses.filter(function (r) {
          return r._id !== response._id;
        });
        $scope.$apply();
      });
    }

    function dismissResponse(response) {
      ServerService.p(ReflectiveAssessmentRoutes.VOTE_ON_RESPONSE, {
        courseSessionId: vm.courseSession.id,
        reflectiveAssessmentId: vm.sticky.id,
        voteType: 'DISMISS',
        responseId: response._id
      }).then(function (data) {
        vm.sticky.visibleResponses = vm.sticky.visibleResponses.filter(function (r) {
          return r._id !== response._id;
        });
        $scope.$apply();
      });
    }

    /*
     Helper within the function to send question to server and save it
     */
    function sendQuestionToServer(question) {
      ServerService.p(CourseSessionRoutes.QUESTIONS_ADD, {
        content: question,
        created: new Date(),
        courseSessionId: vm.courseSession.id
      }).then(function (data) {
        var success = data.success;


        if (success) {
          vm.modeAskQuestion = false;
          vm.backText = 'Courses';
          vm.input.question = '';

          toastr.success('Question submitted successfully!');
          vm.mode = 'QUESTIONS';
          $scope.$apply();
        }
      });
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

      var wordArray = question.split(' ');
      var noLongWords = true;

      wordArray.forEach(function (w) {
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
      if (vm.questionList.length > 0) {
        QuestionListService.checkSimilarity(question, vm.questionList, function (similarityIndex) {
          //i.e. nothing similar found
          if (similarityIndex == -1) {
            console.log("No similar questions here : " + similarityIndex);
            vm.sendQuestionToServer(question);
          } else {
            console.log(isNaN(similarityIndex));
            console.log("Similar found, build vote logic here");
            console.log(JSON.stringify(similarityIndex));
            $scope.$broadcast('SIMILAR_QUESTION_ATTEMPTED', {
              question: vm.questionList[similarityIndex],
              courseSessionId: vm.courseSession.id,
              userId: vm.userId
            });
            vm.modeAskQuestion = false;
            vm.backText = 'Courses';
            vm.input.question = '';
            vm.mode = 'QUESTIONS';
            $scope.$apply();
          }
        });
      } else {
        //first question, this must be added
        console.log("first queston");
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

      var vote = {
        type: type,
        created: new Date()
      };

      ServerService.post(CourseSessionRoutes.QUESTIONS_VOTE, {
        type: type,
        courseSessionId: vm.courseSession.id,
        questionId: question._id,
        vote: vote,
        questionUserId: question.userId
      }, function (successResponse) {
        var data = successResponse.data;
        var success = data.success;


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
      }, function (failResponse) {});
    }

    /**
     * When the add question button is clicked the session will change to inputmode
     * which will prompt the user to enter in a question
     */
    function beginQuestionInputMode() {

      QuestionListService.isQuestionListActive(vm.courseSession.id, function (val) {
        if (!!val) {
          vm.mode = 'ASK';
          vm.modeAskQuestion = true;
          vm.backText = 'Questions';
        } else {
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

      ServerService.p(CourseSessionRoutes.ALERTS_ADD, { created: new Date(),
        courseSessionId: vm.courseSession.id
      }).then(function (data) {
        var success = data.success;

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
      vm.backText = 'Courses';
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
      vm.sticky = { id: id, created: created, content: prompt, type: 'REFLECTIVE' };

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
    function initExistingReflectiveAssessment(id, prompt, created, responses, visibleResponses, responsesReviewed, responding) {
      // Create a sticky to display
      vm.sticky = { id: id, created: created, content: prompt, type: 'REFLECTIVE' };

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

      return responses.filter(function (r) {
        return !responses[r._id];
      });
    }

    /**
     * Queries the server to see if there are any active Assessments in this Course Session,
     * if there is the UI will be set to acknowledge that 
     * 
     * @param courseSessionId {string} - The id associated with this Course Session
     */
    function receivePriorSelections(courseSessionId) {
      ServerService.post(CourseSessionRoutes.ASSESSMENTS_GET_PRIOR_SELECTIONS, {
        courseSessionId: courseSessionId
      }, function (responseSuccess) {
        var data = responseSuccess.data;
        var success = data.success;
        var type = data.type;


        if (success) {
          var responses = data.responses;
          var responding = data.responding;
          var visibleResponses = data.visibleResponses;
          var responsesReviewed = data.responsesReviewed;
          var id = data.id;
          var prompt = data.prompt;
          var created = data.created;
          var options = data.options;
          var optionSelected = data.optionSelected;


          switch (type) {
            case 'REFLECTIVE':
              initExistingReflectiveAssessment(id, prompt, created, responses, visibleResponses, responsesReviewed, responding);
              break;

            case 'INSTANT':
              initExistingInstantAssessment(id, prompt, created, options, optionSelected);
              break;

            case 'NONE':
              vm.showSticky = false;
              break;
          }
        }
      }, function (responseFail) {});
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
      vm.sticky = { id: id, created: created, content: prompt, type: 'INSTANT' };

      // Display the sticky on the View
      vm.showSticky = true;

      vm.askingQuestion = false;

      // Take the student to the response screen
      vm.mode = 'INSTANT';

      // Create an array for the options of the Instant Assessment
      if (options.length > 0) {
        vm.sticky.options = [];
        options.forEach(function (o) {
          vm.sticky.options.push(o.content);
        });
      } else if (options.length === 0) {
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
      vm.sticky = { id: id, created: created, content: prompt, type: 'INSTANT' };

      // Display the sticky on the View
      vm.showSticky = true;

      // Create an array for the options of the Instant Assessment
      if (options.length > 0) {
        vm.sticky.options = [];
        options.forEach(function (o) {
          vm.sticky.options.push(o.content);
        });
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
      InstantAssessmentService.clickOption(index, vm.sticky.optionSelected, vm.sticky.id, vm.courseSession.id, function (err, selection) {
        if (err) {
          console.error(err);
          return;
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

      var type = sticky.type;
      var content = sticky.content;


      switch (type) {
        case 'REFLECTIVE':
          return content ? 'Reflective Assessment: ' + content : 'Reflective Assessment: Verbal or slide question proposed.';

        case 'INSTANT':
          return content ? 'Instant Assessment: ' + content : 'Instant Assessment: Verbal or slide question proposed.';
      }
    }

    function getVisibleResponses(r) {
      if (r.userId.toString() === vm.userId.toString()) return false;
      var userVote = r.votes.filter(function (v) {
        return v.userId.toString() === vm.userId.toString() && r.userId.toString() !== vm.userId.toString();
      })[0];
      return !userVote;
    }

    var RA_STARTED = SocketRoutes.REFLECTIVE_ASSESSMENT_STARTED + ':' + vm.courseSession.id;
    $rootScope.$on(RA_STARTED, function (event, data) {
      initReflectiveAssessment(data.id, data.prompt, data.created);
      $scope.$apply();
    });

    $rootScope.$on('RA_RESPONSE_RECEIVED', function (event, data) {
      var responses = data.responses;

      vm.sticky.responses = responses;
      vm.sticky.visibleResponses = responses.filter(getVisibleResponses);
      $scope.$apply();
    });

    var RA_STOP = SocketRoutes.REFLECTIVE_ASSESSMENT_STOP + ':' + vm.courseSession.id;
    $rootScope.$on(RA_STOP, function (event, data) {
      stopReflectiveAssessment();
      $scope.$apply();
    });

    var IA_STARTED = SocketRoutes.INSTANT_ASSESSMENT_STARTED + ':' + vm.courseSession.id;
    $rootScope.$on(IA_STARTED, function (event, data) {
      initInstantAssessment(data.id, data.prompt, data.created, data.options);
      $scope.$apply();
    });

    var MC_STOP = SocketRoutes.MC_STOP + ':' + vm.courseSession.id;
    $rootScope.$on(MC_STOP, function (event, data) {
      stopInstantAssessment();
      $scope.$apply();
    });

    $rootScope.$on('COURSE_SESSION_END', function (event, data) {
      notifyThatClassIsOver();
      $scope.$apply();
    });

    $rootScope.$on($rootScope.username, function (event, data) {
      toastr.info('This account has logged in elsewhere');
      vm.logOut();
    });

    var confusionBar = document.getElementById('confusionbar');
    // Interval to get confusion amount
    var ONE_SECONDS = 1000;
    var getConfusion = $interval(function () {
      ServerService.p(CourseSessionRoutes.ALERTS_GET_NUMBER_AND_PERCENT, {
        courseSessionId: vm.courseSession.id
      }).then(function (result) {
        var number = result.number;
        var percent = result.percent;
        var threshold = result.threshold;


        try {
          $scope.$apply(function () {
            confusionBar.style.width = vm.courseSession.activeAlertPercent + '%';
          });
        } catch (e) {
          // Handle silently
        }
        vm.courseSession.activeAlerts = number;
        vm.courseSession.activeAlertPercent = percent;
        vm.courseSession.threshold = threshold || 20;
      });
    }, ONE_SECONDS);
    intervals = [].concat(_toConsumableArray(intervals), [getConfusion]);

    // Interval Function To Check Connection Status
    var FIVE_SECONDS = 5000;
    var checkConnection = $interval(function () {
      if (!window.navigator) {
        vm.connectionStatus = "unknown";
      } else {
        var socketStatus = $rootScope.socket.connected;
        var networkStatus = window.navigator.onLine;

        if (!socketStatus && !networkStatus) {
          vm.connectionStatus = "disconnected";
        } else if (!socketStatus && networkStatus || socketStatus && !networkStatus) {
          vm.connectionStatus = "unstable";
        } else {
          vm.connectionStatus = "connected";
        }
      }
    }, FIVE_SECONDS);
    intervals = [].concat(_toConsumableArray(intervals), [checkConnection]);

    $scope.$on('$destroy', function () {
      intervals.forEach(function (i) {
        $interval.cancel(i);
      });
    });
  }
})();
'use strict';

(function () {
  angular.module('app').controller('InstructorAssessmentController', InstructorAssessmentController);

  InstructorAssessmentController.$inject = ['$rootScope', '$scope', 'ServerService', 'ReflectiveAssessmentRoutes', 'CourseSessionRoutes'];

  function InstructorAssessmentController($rootScope, $scope, ServerService, ReflectiveAssessmentRoutes, CourseSessionRoutes) {
    var vm = this;

    vm.select = select;
    vm.proposeOrStop = proposeOrStop;

    // Default
    vm.selected = 'INSTANT';
    vm.active = null;
    vm.activationLoading = false;
    vm.last = '';
    vm.topReflectiveResponses = [];

    function proposeOrStop(courseSessionId, question, options, selectedType, activeId, activeType) {
      vm.activationLoading = true;
      if (!vm.active) {
        activateCurrentAssessment(courseSessionId, question, options, selectedType);
      } else {
        stopActiveAssessment(courseSessionId, activeId, activeType);
      }
    }

    function activateReflectiveAssessment(courseSessionId, questionContent) {
      $scope.$emit('TAB_SELECTED', { tab: 'ASSESSMENT' });
      $scope.$emit('ASSESSMENT_ACTIVATED', {});
      ServerService.p(ReflectiveAssessmentRoutes.ADD, { courseSessionId: courseSessionId, questionContent: questionContent }).then(function (data) {
        var success = data.success;
        var id = data.id;
        var question = data.question;

        if (success) {
          vm.active = generateActiveAssessment(id, 'REFLECTIVE', question);
          $scope.$broadcast('ASSESSMENT_ACTIVATED', {});
        }
        vm.activationLoading = false;
      });
    }

    function activateInstantAssessment(courseSessionId, content, options) {

      ServerService.p(InstantAssessmentRoutes.CREATE, { courseSessionId: courseSessionId, content: content, options: options }).then(function (data) {
        var success = data.success;
        var instantAssessmentId = data.instantAssessmentId;

        if (success) {
          vm.active = generateActiveAssessment(instantAssessmentId, 'INSTANT', content);
          $scope.$emit('ASSESSMENT_ACTIVATED', { activeAssessmentId: instantAssessmentId });
          $scope.$broadcast('ASSESSMENT_ACTIVATED', { activeAssessmentId: instantAssessmentId });
        }
        vm.activationLoading = false;
      });
    }

    function generateActiveAssessment(id, type) {
      var question = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

      return {
        id: id,
        type: type,
        question: question,
        responses: []
      };
    }

    function stopReflectiveAssessment(courseSessionId, reflectiveAssessmentId) {
      ServerService.p(ReflectiveAssessmentRoutes.STOP, { courseSessionId: courseSessionId, reflectiveAssessmentId: reflectiveAssessmentId }).then(function (data) {
        var success = data.success;
        var top = data.top;

        if (success) {
          vm.active = null;
          vm.last = 'REFLECTIVE';
          vm.topReflectiveResponses = top;
          top.forEach(function (res) {
            res.numUpvotes = 0;
            res.votes.forEach(function (vote) {
              if (vote.type === 'UP') {
                res.numUpvotes++;
              }
            });
          });
          $scope.$broadcast('ASSESSMENT_STOPPED', {});
        }
        vm.activationLoading = false;
      });
    }

    function stopInstantAssessment(courseSessionId, instantAssessmentId) {
      ServerService.p(InstantAssessmentRoutes.STOP, { courseSessionId: courseSessionId, instantAssessmentId: instantAssessmentId }).then(function (data) {
        var success = data.success;

        if (success) {
          vm.active = null;
          vm.last = 'INSTANT';
          $scope.$broadcast('ASSESSMENT_STOPPED', { top: top });
        }
        vm.activationLoading = false;
      });
    }

    function select(type) {
      vm.selected = type;
    }

    function activateCurrentAssessment(courseSessionId, question, options, selection) {
      vm.topReflectiveResponses = [];
      switch (selection) {
        case 'REFLECTIVE':
          {
            activateReflectiveAssessment(courseSessionId, question);
            break;
          }
        case 'INSTANT':
          {
            activateInstantAssessment(courseSessionId, question, options);
            break;
          }
      }
    }

    function stopActiveAssessment(courseSessionId, assessmentId, type) {
      switch (type) {
        case 'REFLECTIVE':
          {
            stopReflectiveAssessment(courseSessionId, assessmentId);
            break;
          }
        case 'INSTANT':
          {
            stopInstantAssessment(courseSessionId, assessmentId);
            break;
          }
      }
    }

    function getPriorAssessments(courseSessionId) {
      ServerService.p(CourseSessionRoutes.ASSESSMENTS_GET_PRIOR_ACTIVE, { courseSessionId: courseSessionId }).then(function (data) {
        var success = data.success;
        var hasActiveAssessment = data.hasActiveAssessment;
        var type = data.type;
        var id = data.id;
        var question = data.question;

        if (success && hasActiveAssessment) {
          vm.active = generateActiveAssessment(id, type, question);
          vm.selected = type;
        }
      });
    }

    $scope.$on('USE_FOR_ASSESSMENT', function (event, data) {
      var courseSessionId = data.courseSessionId;
      var content = data.content;

      activateReflectiveAssessment(courseSessionId, content);
    });

    $scope.$on('COURSESESSION_JOINED_ASSESSMENT', function (event, data) {
      var courseSessionId = data.courseSessionId;

      getPriorAssessments(courseSessionId);
    });

    $scope.$on('QUESTIONS_USE_FOR_ASSESSMENT', function (event, data) {
      var courseSessionId = data.courseSessionId;
      var content = data.content;

      activateReflectiveAssessment(courseSessionId, content);
    });

    $scope.$emit('ASSESSMENT_INIT', {});
  }
})();
'use strict';

(function () {
  angular.module('app').controller('InstructorAssessmentProposeController', InstructorAssessmentProposeController);

  InstructorAssessmentProposeController.$inject = ['$scope', 'ServerService'];

  function InstructorAssessmentProposeController($scope, ServerService) {
    var vm = this;
    init();

    $scope.$on('ASSESSMENT_ACTIVATED', function (event, data) {
      vm.input.question = '';
    });

    function init() {
      vm.input = {
        question: ''
      };
    }
  }
})();
'use strict';

(function () {
  angular.module('app').controller('InstructorAssessmentStatisticsController', InstructorAssessmentStatisticsController);

  InstructorAssessmentStatisticsController.$inject = ['$rootScope', '$scope', 'SocketService'];

  function InstructorAssessmentStatisticsController($rootScope, $scope, SocketService) {
    var vm = this;

    vm.currentAlerts = 0;
    vm.attendance = 0;
    vm.numberAnswered = 0;
    vm.numberReviewed = 0;
    vm.percentAnswered = '';

    $scope.$on('ASSESSMENT_STOP', function (event, data) {
      resetAssessmentInteraction(vm);
    });

    $scope.$on('ASSESSMENT_ACTIVATED', function (event, data) {
      resetAssessmentInteraction(vm);
    });

    function resetAssessmentInteraction(vm) {
      vm.numberAnswered = 0;
      vm.numberReviewed = 0;
      vm.percentAnswered = '0%';
    }

    $scope.$on('ASSESSMENT_INSTANT_SELECTION', function (event, data) {
      var answerObject = data.answerObject;

      vm.numberAnswered = answerObject.A + answerObject.B + answerObject.C + answerObject.D + answerObject.E;
    });

    $scope.$on('ASSESSMENT_REVIEWED', function (event, data) {
      var numberReviewed = data.numberReviewed;

      vm.answersSubmitted = numberReviewed;
      $scope.$apply();
    });

    $scope.$on('ASSESSMENT_ANSWERED', function (event, data) {
      var numberAnswered = data.numberAnswered;

      vm.numberAnswered = numberAnswered;
      $scope.$apply();
    });

    $scope.$on('ALERT_UPDATED', function (event, data) {
      var currentAlerts = data.currentAlerts;

      vm.currentAlerts = currentAlerts;
      $scope.$apply();
    });

    $scope.$on('STUDENT_JOINED', function (event, data) {
      var attendance = data.attendance;

      vm.attendance = attendance;
      $scope.$apply();
    });

    $scope.$on('STUDENT_LEFT', function (event, data) {
      var attendance = data.attendance;

      vm.attendance = attendance;
      $scope.$apply();
    });

    $scope.$on('RA_RESPONSE_NUMBER', function (event, data) {
      var number = data.number;

      vm.numberAnswered = number;
      vm.percentAnswered = Math.floor(vm.numberAnswered / vm.attendance);
      $scope.$apply();
    });

    $scope.$on('RA_RESPONSE_REVIEWED', function (event, data) {
      var number = data.number;

      vm.numberReviewed = number;
      $scope.$apply();
    });

    $scope.$on('INSTANT_ASSESSMENT_SELECTION', function (event, data) {
      var answerObject = data.answerObject;

      vm.numberAnswered = answerObject.A + answerObject.B + answerObject.C + answerObject.D + answerObject.E;
      var percent = vm.numberAnswered / vm.attendance * 100;
      vm.percentAnswered = Math.round(percent) + '%';
      $scope.$apply();
    });
  }
})();
'use strict';

(function () {
  angular.module('app').controller('InstructorHomeController', InstructorHomeController);

  InstructorHomeController.$inject = ['$scope'];

  function InstructorHomeController($scope) {}
})();
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  angular.module('app').controller('InstructorQuestionListController', InstructorQuestionListController);

  InstructorQuestionListController.$inject = ['$rootScope', '$scope', 'SocketRoutes', 'QuestionListService', 'ServerService', 'CourseSessionRoutes', 'SocketService'];

  function InstructorQuestionListController($rootScope, $scope, SocketRoutes, QuestionListService, ServerService, CourseSessionRoutes, SocketService) {
    var vm = this;

    vm.loading = true;

    vm.dismissQuestion = dismissQuestion;
    vm.timeFromNow = timeFromNow;

    vm.courseSession = {};
    vm.courseSession.id = "";

    vm.toggleQuestionList = toggleQuestionList;
    vm.questionListToggleValue = true;
    function dismissQuestion(question, questionId, courseSessionId) {
      vm.all = vm.all.filter(function (q) {
        return q._id.toString() !== questionId.toString();
      });
      ServerService.p(CourseSessionRoutes.QUESTIONS_REMOVE, { questionId: questionId, courseSessionId: courseSessionId }).then(function (data) {
        var success = data.success;

        if (!success) {
          toastr.error('Server Error', 'Please dismiss question again.');
          vm.all.push(question);
        }
      });
    }

    function timeFromNow(dateString) {
      return moment(dateString).fromNow();
    }

    function init(courseSessionId) {
      QuestionListService.get(courseSessionId).then(function (questions) {
        vm.all = questions;
        vm.loading = false;
        $scope.$emit('QUESTION_NUMBER', {
          number: vm.all.length
        });
      });
      QuestionListService.isQuestionListActive(courseSessionId, function (val) {
        vm.questionListToggleValue = val;
        console.log("After checking: " + vm.questionListToggleValue);
      });
      vm.courseSession.id = courseSessionId;
    }

    $scope.$on('QUESTION_ADDED', function (event, data) {
      var questions = data.questions;

      vm.all = questions;
      $scope.$emit('QUESTION_NUMBER', {
        number: vm.all.length
      });
      $scope.$apply();
    });

    $scope.$on('QUESTION_DISMISSED', function (event, data) {
      var questions = data.questions;


      vm.all = questions;

      $scope.$emit('QUESTION_NUMBER', {
        number: vm.all.length
      });
      $scope.$apply();
    });

    $scope.$on('QUESTION_VOTE', function (event, data) {
      var questionId = data.questionId;
      var vote = data.vote;


      var indexAll = vm.all.findIndex(function (q) {
        return q._id.toString() === questionId.toString();
      });
      switch (vote.type) {
        case 'UP':
          {
            vm.all[indexAll].votes = [].concat(_toConsumableArray(vm.all[indexAll].votes), [vote]);
            vm.all[indexAll].rank += 1;
            break;
          }
        case 'DOWN':
          {
            vm.all[indexAll].votes = vm.all[indexAll].votes.filter(function (v) {
              return v.userId.toString() !== vote.userId.toString();
            });
            vm.all[indexAll].rank -= 1;
          }
      }
      $scope.$apply();
    });

    $scope.$on('COURSESESSION_JOINED_QUESTION', function (event, data) {
      var courseSessionId = data.courseSessionId;

      vm.courseSessionId = courseSessionId;

      init(courseSessionId);

      SocketService.handleQuestionAdded(courseSessionId);
      SocketService.handleQuestionDismissed(courseSessionId);
      SocketService.handleQuestionVote(courseSessionId);
    });

    function toggleQuestionList() {
      console.log("toggle : " + vm.questionListToggleValue);
      QuestionListService.toggleQuestionList(vm.courseSession.id);
    }

    $scope.$emit('QUESTION_LIST_INIT', {});
  }
})();
'use strict';

/** Author: Anthony Altieri **/

(function () {
  'use strict';

  angular.module('app').controller('LoginController', LoginController);

  LoginController.$inject = ['$rootScope', '$state', 'UserService', 'ServerService', 'UserRoutes', 'CourseRoutes', '$interval'];

  function LoginController($rootScope, $state, UserService, ServerService, UserRoutes, CourseRoutes, $interval) {
    var vm = this;

    vm.input = {
      email: '',
      password: ''
    };
    vm.invalidEmail = false;
    vm.emailError = false;
    vm.passwordError = false;

    UserService.handleAlreadyLoggedIn(function (isLoggedIn) {
      if (isLoggedIn) {
        $state.go('dash.courses.active');
      } else {
        $rootScope.loading = false;
      }
    });

    vm.tryLogin = tryLogin;
    vm.goToSignUp = goToSignUp;
    vm.validEmail = validEmail;

    function tryLogin(input) {
      vm.loggingIn = true;
      var email = input.email.trim().toLowerCase();
      if (!email) {
        toastr.error('Incorrect Email');
        return;
      }
      var password = input.password.trim();
      if (!password) {
        toastr.error('Incorrect Password');
        return;
      }
      UserService.logIn(email, password, function (error) {
        switch (error) {
          case 'ERROR_EMAIL':
            vm.emailError = true;
            break;
          case 'ERROR_PASSWORD':
            vm.emailError = false;
            vm.passwordError = true;
            break;
        }
        vm.loggingIn = false;
      });
    }

    function goToSignUp() {
      $state.go('launch.signup');
    }

    function validEmail(email) {
      var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(email);
    }
  }
})();
'use strict';

/**
 * Created by bharatbatra on 9/28/16.
 */
/** Author: Anthony Altieri **/

(function () {
    'use strict';

    angular.module('app').controller('MCQPopUpController', MCQPopUpController);

    MCQPopUpController.$inject = ['$rootScope', '$scope', '$log', '$state', '$stateParams', '$interval', 'ServerService', 'ReflectiveAssessmentRoutes', 'SocketService', 'SocketRoutes', 'CourseSessionRoutes', 'CourseRoutes', 'CourseSessionService', 'InstantAssessmentService'];

    function MCQPopUpController($rootScope, $scope, $log, $state, $stateParams, $interval, ServerService, ReflectiveAssessmentRoutes, SocketService, SocketRoutes, CourseSessionRoutes, CourseRoutes, CourseSessionService, InstantAssessmentService) {

        $rootScope.loading = false;

        var vm = this;
        vm.courseSession = {};
        vm.activeAssessmentId = null; //set by reading localStorage

        var stateParams = readLocalStorage("stateParams");
        var intervalPromises = [];

        //Setup
        if (stateParams) {
            init(vm, stateParams);
        } else {
            console.log("Error. no init variables");
        }

        //Overlay to confirm end session
        vm.showEndSessionOverlay = false;

        // Sockets
        handleSockets(SocketService, vm.courseSession.id);

        function init(vm, stateParams) {
            writeLocalStorage("stateParams", stateParams);
            var _stateParams$data = stateParams.data;
            var courseSessionId = _stateParams$data.courseSessionId;
            var code = _stateParams$data.code;
            var courseId = _stateParams$data.courseId;
            var instructorName = _stateParams$data.instructorName;

            initCourseSession(vm, courseSessionId, code, courseId);
            getAttendance(courseSessionId).then(function (attendance) {
                vm.courseSession.attendance = attendance;
            });
            ServerService.p(CourseSessionRoutes.ALERTS_GET_NUMBER_ACTIVE, {}).then(function (data) {
                var success = data.success;
                var activeAlerts = data.activeAlerts;

                if (success) {
                    vm.courseSession.activeAlerts = activeAlerts;
                }
            }).catch(function (error) {});
            initAssessmentGraph(courseSessionId);
            vm.instructorName = instructorName;
        }

        /**
         * Initializes the vm.session object with its default values and resets the metrics
         * that are associated with the active Reflective Assessment
         *
         * @param courseSessionId {string} - The id associated with the Course Session
         * @param code {string} - The course code for this course
         * @param courseId {string} - The id associated with the Course this Course Session is for
         */
        function initCourseSession(vm, courseSessionId, code, courseId) {
            vm.courseSession = {
                id: courseSessionId,
                active: true,
                courseId: courseId,
                code: code,
                isRAActive: false,
                activeAlerts: 0,
                confusionThreshold: 20,
                recentDiscussionAnswers: []
            };
        }

        function initAssessmentGraph(courseSessionId) {
            vm.instantAssessmentGraph = {};
            vm.instantAssessmentGraph.data = readLocalStorage(courseSessionId + "-mcqData");
            if (vm.instantAssessmentGraph.data) {
                console.log("found the graph data");
            } else {
                //Graph Data - this is always an array of objects in nvd3
                vm.instantAssessmentGraph.data = [{
                    key: "first attempt",
                    values: [{
                        "label": "A",
                        "value": 0
                    }, {
                        "label": "B",
                        "value": 0
                    }, {
                        "label": "C",
                        "value": 0
                    }, {
                        "label": "D",
                        "value": 0
                    }, {
                        "label": "E",
                        "value": 0
                    }]
                }];
            }
            //Graph Config
            vm.instantAssessmentGraph.options = {
                chart: {
                    type: 'discreteBarChart',
                    height: 300,
                    width: 425, //TODO: FIGURE OUT HOW TO MAKE THESE RESPONSIVE
                    yDomain: [0, 100],
                    x: function x(d) {
                        return d.label;
                    },
                    y: function y(d) {
                        return d.value;
                    },
                    showValues: true,
                    duration: 500,
                    xAxis: {
                        axisLabel: 'Options'
                    },
                    yAxis: {
                        axisLabel: '% of students',
                        axisLabelDistance: -10
                    },
                    callback: function callback(chart) {
                        console.log("mcq graph callback");
                        d3.selectAll("rect").on('click', function (e, i, nodes) {
                            console.log(JSON.stringify(i, null, 2));
                            /*
                            Experimentally observed index conversion
                             */

                            var correctIndex = i - 1;

                            if (correctIndex >= 0 && correctIndex < 5) {

                                InstantAssessmentService.markCorrectOption(vm.activeAssessmentId, correctIndex);
                            }
                        });
                    }
                }
            };
        }

        function getAttendance(courseSessionId) {
            return new Promise(function (resolve, reject) {
                ServerService.post(CourseSessionRoutes.ATTENDANCE_GET, { courseSessionId: courseSessionId
                }, function (resSuccess) {
                    var data = resSuccess.data;
                    var success = data.success;
                    var attendance = data.attendance;


                    if (success) {
                        resolve(attendance);
                        return;
                    }

                    reject(null);
                }, function (resFail) {
                    console.log("failed miserably");
                });
            });
        }

        function handleSockets(SocketService, courseSessionId) {
            console.log("handles sockets id: " + courseSessionId);
            SocketService.handleStudentJoinedCourseSession(courseSessionId);
            SocketService.handleStudentLeaveCourseSession(courseSessionId);
            SocketService.handleReflectiveAssessmentResponseInstructor(courseSessionId);
            SocketService.handleMCSelectionMade(courseSessionId);
            SocketService.handleReflectiveAssessmentResponseReviewed(courseSessionId);
        }

        $rootScope.$on('STUDENT_JOINED', function (event, data) {
            var attendance = data.attendance;

            $scope.$broadcast('STUDENT_JOINED', { attendance: attendance });
            vm.courseSession.attendance = data.attendance;
        });

        var ROUTE_STUDENT_LEFT = SocketRoutes.STUDENT_LEFT + ':' + vm.courseSession.id;
        $rootScope.$on(ROUTE_STUDENT_LEFT, function (event, data) {
            var attendance = data.attendance;

            $scope.$broadcast('STUDENT_LEFT', { attendance: attendance });
            vm.courseSession.attendance = data.attendance;
        });

        $rootScope.$on('INSTANT_ASSESSMENT_SELECTION', function (event, data) {
            vm.showInstantAssessmentGraph = true;
            var answerObject = data.answerObject;

            var numberAnswersRecieved = answerObject['A'] + answerObject['B'] + answerObject['C'] + answerObject['D'] + answerObject['E'];
            vm.instantAssessmentGraph.data[0].values[0].value = answerObject['A'] / numberAnswersRecieved * 100;
            vm.instantAssessmentGraph.data[0].values[1].value = answerObject['B'] / numberAnswersRecieved * 100;
            vm.instantAssessmentGraph.data[0].values[2].value = answerObject['C'] / numberAnswersRecieved * 100;
            vm.instantAssessmentGraph.data[0].values[3].value = answerObject['D'] / numberAnswersRecieved * 100;
            vm.instantAssessmentGraph.data[0].values[4].value = answerObject['E'] / numberAnswersRecieved * 100;

            writeLocalStorage(vm.courseSession.id + "-mcqData", vm.instantAssessmentGraph.data);
            $scope.$apply();
        });

        var ROUTE_RESPONSE_RECEIVED = SocketRoutes.REFLECTIVE_ASSESSMENT_RESPONSE_RECEIVED + ':' + vm.courseSession.id;
        $rootScope.$on(ROUTE_RESPONSE_RECEIVED, function (event, data) {
            $scope.$broadcast('REFLECTIVE_RESPONSE_RECEIVED', data);
            $scope.$apply();
        });

        var ROUTE_RESPONSE_REVIEWED = SocketRoutes.FR_RESPONSE_REVIEWED + ':' + vm.courseSession.id;
        $rootScope.$on(ROUTE_RESPONSE_REVIEWED, function (event, data) {
            vm.activeAssessment.numberReviewed = data.numberResponsesReviewed;
            $scope.$apply();
        });

        // Update the clock every minute
        var promiseTime = $interval(function () {
            vm.activeAssessmentId = readLocalStorage(vm.courseSession.id + "-activeAssessmentId");
            // $scope.$apply();
        }, 1000);
        intervalPromises.push(promiseTime);

        $scope.$on('$destroy', function () {
            intervalPromises.forEach(function (p) {
                $interval.cancel(p);
            });
        });
    }
})();
'use strict';

/** Author: Anthony Altieri **/

(function () {
  'use strict';

  angular.module('app').controller('SignUpController', SignUpController);

  SignUpController.$inject = ['$rootScope', '$state', 'ServerService', 'UserRoutes', 'UserService'];

  function SignUpController($rootScope, $state, ServerService, UserRoutes, UserService) {
    var vm = this;

    $rootScope.loading = false;

    vm.input = {
      email: '',
      firstname: '',
      lastname: ''
    };
    vm.signingUp = false;

    UserService.handleAlreadyLoggedIn(function (isLoggedIn) {
      if (isLoggedIn) {
        $state.go('dash.courses.active');
      }
    });

    vm.goBack = goBack;
    vm.createAccount = createAccount;

    function goBack() {
      $state.go('launch.login');
    }

    function createAccount(input) {
      vm.signingUp = true;

      var email = input.email.trim().toLocaleLowerCase();
      var password = input.password;
      var firstName = input.firstName;
      var lastName = input.lastName;

      UserService.createAccount(email, password, firstName, lastName, function () {
        vm.signingUp = false;
      });
    }
  }
})();
'use strict';

/** Author: Anthony Altieri **/

(function () {
  'use strict';

  angular.module('app').controller('SplashController', SplashController);

  SplashController.$inject = ['$timeout', '$state'];

  function SplashController($timeout, $state) {
    var SPLASH_WAIT_TIME = 1500;

    $timeout(function () {
      $state.go('launch.login');
    }, SPLASH_WAIT_TIME);
  }
})();
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/** @author Anthony Altieri **/

;(function () {
  angular.module('app').controller('StudentQuestionListController', StudentQuestionListController);

  StudentQuestionListController.$inject = ['$rootScope', '$scope', 'ServerService', 'VoteType', 'CourseSessionRoutes', 'CourseSessionService', 'SocketRoutes', 'SocketService'];

  function StudentQuestionListController($rootScope, $scope, ServerService, VoteType, CourseSessionRoutes, CourseSessionService, SocketRoutes, SocketService) {
    var vm = this;

    init(vm);

    vm.loading = true;

    vm.voteUp = voteUp;
    vm.voteDown = voteDown;
    vm.isActiveThumbFadeIn = isActiveThumbFadeIn;
    vm.isInactiveThumbFadeOut = isInactiveThumbFadeOut;
    vm.filterMe = filterMe;
    vm.filterMostRecent = filterMostRecent;
    vm.filterMostVoted = filterMostVoted;

    if (!$rootScope.questions) {
      $rootScope.questions = {};
    }

    function isActiveThumbFadeIn(votes, isLoading, userId) {
      var userVote = votes.filter(function (v) {
        return v.userId.toString() === userId.toString();
      })[0];
      return userVote && !isLoading;
    }

    function isInactiveThumbFadeOut(votes, isLoading, userId) {
      var userVote = votes.filter(function (v) {
        return v.userId.toString() === userId.toString();
      })[0];
      return userVote && !isLoading || isLoading;
    }

    /**
     * Allows the user to upvote a question
     *
     * @param {object} question - The StudentQuestion that is being voted on
     * @param {string} question._id - The id associated with this Question
     * @param {string} question.userId - The id associated with the User that posted the Question
     */
    function voteUp(question, courseSessionId, userId) {
      if (!!question.loading) return;
      var userVote = question.votes.filter(function (v) {
        return v.userId.toString() === userId.toString();
      })[0];
      if (!!userVote) return;
      question.loading = true;
      vote(VoteType.UP, question, courseSessionId);
    }

    /**
     * Allows the user to downvote a question
     *
     * @param {object} question - The StudentQuestion that is being voted on
     * @param {string} question._id - The id associated with this Question
     * @param {string} question.userId - The id associated with the User that posted the Question
     */
    function voteDown(question, courseSessionId, userId) {
      if (!!question.loading) return;
      var userVote = question.votes.filter(function (v) {
        return v.userId.toString() === userId.toString();
      })[0];
      if (!userVote) return;
      question.loading = true;
      vote(VoteType.DOWN, question, courseSessionId);
    }

    /**
     * Submits a vote of a specific type to the server for a particular question
     * @param {object} question - The StudentQuestion that is being voted on
     * @param {string} question._id - The id associated with this Question
     * @param {string} question.userId - The id associated with the User that posted the Question
     * @param {string} type - The type of the vote
     */
    function vote(type, question, courseSessionId) {
      if (vm.userId.toString() === question.userId.toString()) {
        toastr.error('You can\'t vote on your own question');
        question.loading = false;
        return;
      }
      var vote = {
        type: type,
        created: new Date()
      };

      ServerService.post(CourseSessionRoutes.QUESTIONS_VOTE, {
        type: type,
        courseSessionId: courseSessionId,
        vote: vote,
        questionId: question._id,
        questionUserId: question.userId
      }, function (resSuccess) {
        var data = resSuccess.data;
        var success = data.success;


        if (!success) {
          toastr.error('Error voting on question');
        }
        question.loading = false;
      }, function (resFail) {});
    }

    /**
     * Filters the visible questions so questions with the most rank are on the top
     */
    function filterMostVoted() {
      if (vm.filter === 'MOST_VOTED') return;
      vm.filter = 'MOST_VOTED';
      vm.visible = filterQuestions(vm.filter, vm.all);
      // try {
      //   $scope.$apply();
      // }
      // catch(err){
      //   console.log("Digest Cycle Error : " + err);
      // }
    }

    /**
     * Filters the visible questions so only questions proposed by the user are visible
     */
    function filterMe() {
      if (vm.filter === 'ME') return;
      vm.filter = 'ME';
      vm.visible = filterQuestions('ME', vm.all);
      // try {
      //   $scope.$apply();
      // }
      // catch(err){
      //   console.log("Digest Cycle Error : " + err);
      // }
    }

    /**
     * Filters the visible questions with the most recent on the top
     */
    function filterMostRecent() {
      if (vm.filter === 'MOST_RECENT') return;
      vm.filter = 'MOST_RECENT';
      vm.visible = filterQuestions('MOST_RECENT', vm.all);
      // try {
      //   $scope.$apply();
      // }
      // catch(err){
      //   console.log("Digest Cycle Error : " + err);
      // }
    }

    /**
     * Filters visible questions as a function of a particular filter
     *
     * @param filter {string} - The type of filter that should be applied to the visible questions
     * @param questions {object[]} - An array of questions for the Course Session
     * @param asked {object} - The hashmap that has a true value for the key of a question that has
     * been asked by the user
     */
    function filterQuestions(filter) {
      var questions = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      switch (filter) {
        case 'MOST_RECENT':
          return questions.sort(function (lhs, rhs) {
            var lhsDate = new Date(Date.parse(lhs.created));
            var rhsDate = new Date(Date.parse(rhs.created));
            if (lhsDate < rhsDate) {
              return 1;
            } else if (lhsDate > rhsDate) {
              return -1;
            } else {
              return 0;
            }
          });

        case 'MOST_VOTED':
          return questions.sort(function (lhs, rhs) {
            return rhs.votes.length - lhs.votes.length;
          });

        case 'ME':
          return filterQuestions('MOST_RECENT', questions).filter(function (q) {
            return q.userId.toString() === vm.userId.toString();
          });
      }
    }

    function init(vm) {
      vm.filter = 'MOST_VOTED';
    }

    $scope.$on('QUESTION_ADDED', function (event, data) {
      var questions = data.questions;

      vm.all = questions;
      $scope.$emit('QUESTION_LIST_AVAILABLE', vm.all);
      vm.visible = filterQuestions(vm.filter, questions);
      try {
        $scope.$apply();
      } catch (err) {
        console.log("DIgest err: " + err);
      }
    });

    $scope.$on('QUESTION_VOTE', function (event, data) {
      var questionId = data.questionId;
      var vote = data.vote;

      var indexAll = vm.all.findIndex(function (q) {
        return q._id.toString() === questionId.toString();
      });
      switch (vote.type) {
        case 'UP':
          {
            vm.all[indexAll].votes = [].concat(_toConsumableArray(vm.all[indexAll].votes), [vote]);
            console.log(JSON.stringify(vm.all[indexAll], null, 2));
            break;
          }
        case 'DOWN':
          {
            vm.all[indexAll].votes = vm.all[indexAll].votes.filter(function (v) {
              return v.userId.toString() !== vote.userId.toString();
            });
          }
      }
      $scope.$emit('QUESTION_LIST_AVAILABLE', vm.all);
      vm.visible = filterQuestions(vm.filter, vm.all);
      try {
        $scope.$apply();
      } catch (err) {
        console.log("Digest Cycle Error : " + err);
      }
    });

    $scope.$on('QUESTION_DISMISSED', function (event, data) {
      var questions = data.questions;


      vm.all = questions;
      vm.visible = filterQuestions(vm.filter, vm.all);
      $scope.$emit('QUESTION_LIST_AVAILABLE', vm.all);
      try {
        $scope.$apply();
      } catch (err) {
        console.log("DIgest err: " + err);
      }
    });

    $scope.$on('INIT_QUESTION_LIST', function (event, data) {
      var courseSessionId = data.courseSessionId;
      var userId = data.userId;

      vm.courseSessionId = courseSessionId;
      vm.userId = userId;

      SocketService.handleQuestionAdded(courseSessionId);
      SocketService.handleQuestionDismissed(courseSessionId);
      SocketService.handleQuestionVote(courseSessionId);

      CourseSessionService.getQuestions(courseSessionId).then(function (questions) {
        vm.all = questions;
        vm.visible = filterQuestions(vm.filter, vm.all);
        vm.loading = false;
        $scope.$emit('QUESTION_LIST_AVAILABLE', vm.all);
        try {
          $scope.$apply();
        } catch (err) {
          console.log("DIgest err: " + err);
        }
      }).catch(function (error) {
        vm.loading = false;
      });
    });

    $scope.$on('SIMILAR_QUESTION_ATTEMPTED', function (event, data) {
      var question = data.question;
      var courseSessionId = data.courseSessionId;
      var userId = data.userId;

      toastr.info("Found a similar question to your input. Upvoting it for you!");
      voteUp(question, courseSessionId, userId);
    });

    $scope.$emit('QUESTION_LIST_INIT', {});
  }
})();
'use strict';

/** Author: Anthony Altieri **/

(function () {
  angular.module('app').factory('CourseService', CourseService);

  CourseService.$inject = ['$state', 'ServerService', 'CourseRoutes'];

  function CourseService($state, ServerService, CourseRoutes) {
    var self = this;

    self.activateOrJoinCourseSession = activateOrJoinCourseSession;
    self.joinCourseSession = joinCourseSession;
    self.getAllCourses = getAllCourses;
    self.getEnrolledCourses = getEnrolledCourses;
    self.handleCourseRegistration = handleCourseRegistration;

    function activateOrJoinCourseSession(userId, courseId) {
      ServerService.post(CourseRoutes.COURSESESSION_ACTIVATE_OR_JOIN, {
        userId: userId,
        courseId: courseId
      }, function (responseSuccess) {
        var data = responseSuccess.data;
        var success = data.success;
        var code = data.code;
        var courseSessionId = data.courseSessionId;
        var instructorName = data.instructorName;
        var confusionThreshold = data.confusionThreshold;


        if (success) {

          $state.go('dash.instructor', {
            data: {
              courseId: courseId,
              courseSessionId: courseSessionId,
              instructorName: instructorName,
              code: code,
              confusionThreshold: confusionThreshold
            }
          });
        }
      }, function (responseFail) {});
    }

    function joinCourseSession(courseId) {
      ServerService.post(CourseRoutes.COURSESESSION_ACTIVE_JOIN, {
        courseId: courseId
      }, function (resSuccess) {
        var data = resSuccess.data;
        var success = data.success;
        var code = data.code;
        var courseSessionId = data.courseSessionId;


        if (success) {
          $state.go('dash.student', {
            data: {
              courseId: courseId,
              code: code,
              courseSessionId: courseSessionId
            }
          });
        }
      }, function (responseFail) {});
    }

    function getAllCourses(callback) {
      ServerService.post(CourseRoutes.GET_ALL, {}, function (resSuccess) {
        var data = resSuccess.data;
        var success = data.success;
        var courses = data.courses;


        if (success) {
          (function () {
            var active = [];
            var inactive = [];

            courses.forEach(function (c) {
              if (c.hasActiveSession) {
                active.push(c);
              } else {
                inactive.push(c);
              }
            });

            callback(active, inactive);
          })();
        }
      }, function (resFail) {});
    }

    function getEnrolledCourses(callback) {
      ServerService.post(CourseRoutes.GET_ENROLLED, {}, function (resSuccess) {
        var data = resSuccess.data;
        var success = data.success;
        var courses = data.courses;


        if (success) {
          (function () {
            var active = [];
            var inactive = [];

            courses.forEach(function (c) {
              if (c.hasActiveSession) {
                active.push(c);
              } else {
                inactive.push(c);
              }
            });

            callback(active, inactive);
          })();
        }
      }, function (resFail) {});
    }

    function handleCourseRegistration() {
      var courseId = readCookie("course-registration");
      if (courseId) {
        ServerService.post(CourseRoutes.REGISTER_STUDENT_TO_COURSE, {
          courseId: courseId
        }, function (resSuccess) {
          toastr.success("You have been enrolled in this course! Setting it up for you!");
        }, function (responseFail) {
          toastr.error("Error - Could not enroll you in this Course");
        });
      }
      eraseCookie("course-registration");
    }

    return self;
  }
})();
'use strict';

/** @Author: Anthony Altieri **/

;(function () {
  angular.module('app').factory('CourseSessionService', CourseSessionService);

  CourseSessionService.$inject = ['$state', 'ServerService', 'CourseSessionRoutes'];

  function CourseSessionService($state, ServerService, CourseSessionRoutes) {
    var self = this;

    self.removeStudentFromAll = removeStudentFromAll;
    self.getQuestionObjects = getQuestionObjects;
    self.getQuestions = getQuestions;
    self.getAttendance = getAttendance;

    function removeStudentFromAll(courseSessionId) {
      ServerService.post(CourseSessionRoutes.STUDENT_REMOVE, {
        courseSessionId: courseSessionId
      }, function (responseSuccess) {}, function (responseFail) {});
    }

    function getQuestionObjects(courseSessionId) {
      return new Promise(function (resolve, reject) {
        ServerService.p(CourseSessionRoutes.QUESTIONS_GET_OBJECTS, { courseSessionId: courseSessionId }).then(function (data) {
          var questions = data.questions;
          var votedOn = data.votedOn;
          var asked = data.asked;

          resolve({ questions: questions, votedOn: votedOn, asked: asked });
        });
      });
      // TODO: handle when server fails
    }

    function getQuestions(courseSessionId) {
      return new Promise(function (resolve, reject) {
        ServerService.p(CourseSessionRoutes.QUESTIONS_GET, { courseSessionId: courseSessionId }).then(function (data) {
          var questions = data.questions;

          resolve(questions);
        });
      });
      // TODO: handle when server fails
    }

    function getAttendance(courseSessionId) {
      return new Promise(function (resolve, reject) {
        ServerService.p(CourseSessionRoutes.ATTENDANCE_GET, { courseSessionId: courseSessionId }).then(function (data) {
          resolve(data);
        });
      });
      // todo: handle error
    }

    return self;
  }
})();
'use strict';

/** Author: Anthony Altieri **/

(function () {
  angular.module('app').factory('InstantAssessmentService', InstantAssessmentService);

  InstantAssessmentService.$inject = ['ServerService'];

  function InstantAssessmentService(ServerService) {
    var self = this;

    self.clickOption = clickOption;
    self.markCorrectOption = markCorrectOption;

    function clickOption(optionIndex, currentSelection, instantAssessmentId, courseSessionId, callback) {
      var newSelection = determineSelectedOption(optionIndex, currentSelection);
      var answerType = !newSelection ? 'UNSELECT' : 'SELECT';

      ServerService.post(InstantAssessmentRoutes.CHOOSE_OPTION, {
        answerType: answerType,
        optionIndex: optionIndex,
        instantAssessmentId: instantAssessmentId,
        courseSessionId: courseSessionId
      }, function (resSuccess) {
        var data = resSuccess.data;
        var success = data.success;


        if (success) {
          callback(null, newSelection);
        } else {
          callback('Server Error', null);
        }
      }, function (resFail) {
        callback('Server Error', null);
      });
    }

    function determineSelectedOption(index, currentSelection) {
      switch (index) {
        case 0:
          return notSelected('A', currentSelection) ? 'A' : null;
        case 1:
          return notSelected('B', currentSelection) ? 'B' : null;
        case 2:
          return notSelected('C', currentSelection) ? 'C' : null;
        case 3:
          return notSelected('D', currentSelection) ? 'D' : null;
        case 4:
          return notSelected('E', currentSelection) ? 'E' : null;
      }
    }

    function notSelected(selection, optionSelected) {
      return optionSelected === null || optionSelected !== selection;
    }

    function markCorrectOption(instantAssessmentId, correctIndex) {
      ServerService.post(InstantAssessmentRoutes.MARK_CORRECT_OPTION, {
        instantAssessmentId: instantAssessmentId,
        correctIndex: correctIndex
      }, function (resSuccess) {
        var data = resSuccess.data;
        var success = data.success;

        console.log("Success : " + data);
        if (success) {
          var correctChar = 'Unknown';
          switch (correctIndex) {
            case 0:
              correctChar = 'A';break;
            case 1:
              correctChar = 'B';break;
            case 2:
              correctChar = 'C';break;
            case 3:
              correctChar = 'D';break;
            case 4:
              correctChar = 'E';break;
          }
          toastr.success("Selected " + correctChar + " as the Correct Answer! ");
        } else {
          toastr.error("Server error; Couldn't set the right answer");
        }
      }, function (resFail) {
        callback('Server Error', null);
      });
    }

    return self;
  }
})();
'use strict';

(function () {
    angular.module('app').factory('QuestionListService', QuestionListService);

    QuestionListService.$inject = ['ServerService', 'CourseSessionRoutes'];

    function QuestionListService(ServerService, CourseSessionRoutes) {
        var self = this;

        self.get = get;
        self.checkSimilarity = checkSimilarity;

        self.toggleQuestionList = toggleQuestionList;
        self.isQuestionListActive = isQuestionListActive;

        self.ML_SERVER = "http://54.70.189.112:8888";
        self.QUESTION_SIMILARITY_PATH = "/similarity";
        self.SIMILARITY_THRESHOLD = 0.7;

        function get(courseSessionId) {
            return new Promise(function (resolve, reject) {
                ServerService.p(CourseSessionRoutes.QUESTIONS_GET, { courseSessionId: courseSessionId }).then(function (data) {
                    var success = data.success;
                    var questions = data.questions;

                    if (success) {
                        resolve(questions);
                        return;
                    }
                    reject(null);
                }).catch(function (response) {
                    reject(response);
                });
            });
        }

        /*
        Formats the questionlist into the desired form for similarity comparison
         */
        function formatQuestionList(questionList) {
            console.log("About to format : ");
            console.log(JSON.stringify(questionList, null, 2));
            var str = "";
            if (questionList) {
                questionList.forEach(function (q) {
                    str += q.content;
                    str += "%";
                });
            }

            return str;
        }

        function checkSimilarity(question, questionList, callback) {
            return new Promise(function (resolve, reject) {
                ServerService.promisePostWithoutPrefix(self.ML_SERVER + self.QUESTION_SIMILARITY_PATH, JSON.stringify({ string1: question, string2: formatQuestionList(questionList), threshold: 0.7 }))
                // ServerService.promisePostWithoutPrefix("http://localhost:8888/api/user/test", JSON.stringify({string1: question, string2: formatQuestionList(questionList), threshold: 0.7 }))
                .then(function (data) {

                    console.log("Server response");
                    console.log(JSON.stringify(data, null, 2));
                    resolve(question);
                    callback(data);
                }).catch(function (error) {
                    console.log("error " + error);reject(error);callback(-1);
                });
            });
        }

        function toggleQuestionList(courseSessionId) {
            ServerService.p(CourseSessionRoutes.QUESTIONLIST_TOGGLE, { courseSessionId: courseSessionId }).then(function (data) {
                if (data.success) {
                    if (data.toggleValue === true) {
                        toastr.success("Turned On The Question List!");
                    } else {
                        toastr.success("Turned Off The Question List!");
                    }
                }
            });
        }

        function isQuestionListActive(courseSessionId, callback) {
            ServerService.p(CourseSessionRoutes.QUESTIONLIST_IS_ACTIVE, { courseSessionId: courseSessionId }).then(function (data) {
                if (data.success) {
                    console.log("Successful retrieval of Question List Status : ");
                    console.log(JSON.stringify(data, null, 2));
                    callback(data.isActive);
                } else {
                    console.log("Error getting the question list setting; default to active");
                    callback(true); //default setting
                }
            });
        }

        return self;
    }
})();
'use strict';

/** Author: Anthony Altieri **/

(function () {
  'use strict';

  angular.module('app').factory('ServerService', ServerService);

  ServerService.$inject = ['$http', '$state', '$rootScope', 'UserRoutes'];

  function ServerService($http, $state, $rootScope, UserRoutes) {
    var self = this;

    self.postWithoutPrefix = postWithoutPrefix;
    self.post = post;
    self.p = p;
    self.promisePostWithoutPrefix = promisePostWithoutPrefix;
    self.checkForValidSession = checkForValidSession;

    var SERVER_PREFIX = null;

    switch ($rootScope.ENV) {
      case 'DEVELOPMENT':
        SERVER_PREFIX = 'http://localhost:8000';
        break;
      case 'PRODUCTION':
        SERVER_PREFIX = 'http://scholarapp.xyz';
        break;
    }

    function postWithoutPrefix(prefix, url, params, successCallback, failCallback) {
      $http.post(prefix + url, params).then(function (response) {
        successCallback(response);
      }, function (response) {
        failCallback(response);
      });
    }

    function post(url, params, successCallback, failCallback) {
      $http.post(SERVER_PREFIX + url, params).then(function (response) {
        successCallback(response);
      }, function (response) {
        failCallback(response);
      });
    }

    function p(url, params) {
      return new Promise(function (resolve, reject) {
        $http.post(SERVER_PREFIX + url, params).then(function (response) {
          resolve(response.data);
        }).catch(function (response) {
          reject(response);
        });
      });
    }

    function promisePostWithoutPrefix(url, params) {
      return new Promise(function (resolve, reject) {
        $http.post(url, params).then(function (response) {
          resolve(response.data);
        }).catch(function (response) {
          reject(response);
        });
      });
    }

    function checkForValidSession() {
      self.post(UserRoutes.CHECK_FOR_VALID_SESSION, {}, function (resSuccess) {
        var data = resSuccess.data;
        var hasValidSession = data.hasValidSession;

        if (!hasValidSession) {
          $state.go('launch.login');
        }
      }, function (responseFail) {});
    }

    return self;
  }
})();
'use strict';

/** Author: Anthony Altieri **/

(function () {
  angular.module('app').factory('SocketService', SocketService);

  SocketService.$inject = ['SocketRoutes', '$rootScope'];

  function SocketService(SocketRoutes, $rootScope) {
    var self = this;

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
      var date = new Date();
      var data = {
        userId: userId,
        courseSessionId: courseSessionId,
        courseId: courseId,
        date: date
      };
      socket.emit('' + SocketRoutes.JOIN_COURSESESSION, data);
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
      var on = SocketRoutes.QUESTION_ADDED + ':' + courseSessionId;
      var broadcast = '' + SocketRoutes.QUESTION_ADDED;
      socket.on(on, function (data) {
        $rootScope.$broadcast(broadcast, { questions: data.questions });
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
      var on = SocketRoutes.VOTED_ON_QUESTION + ':' + courseSessionId;
      var broadcast = 'QUESTION_VOTE';
      socket.on(on, function (data) {
        $rootScope.$broadcast(broadcast, data);
      });
    }

    function handleQuestionDismissed(courseSessionId) {
      var on = SocketRoutes.QUESTION_DISMISSED + ':' + courseSessionId;
      var broadcast = 'QUESTION_DISMISSED';
      socket.on(on, function (data) {
        var questions = data.questions;

        $rootScope.$broadcast(broadcast, { questions: questions });
      });
    }

    function handleAlertAdded(courseSessionId) {
      var on = SocketRoutes.ALERT_ADDED + ':' + courseSessionId;
      var broadcast = 'ALERT_ADDED';
      socket.on(on, function (data) {
        $rootScope.$broadcast(broadcast, data);
      });
    }

    function handleStudentJoinedCourseSession(courseSessionId) {
      var route = SocketRoutes.STUDENT_JOINED + ':' + courseSessionId;
      socket.on(route, function (data) {
        $rootScope.$broadcast('STUDENT_JOINED', { attendance: data.attendance });
      });
    }

    function handleStudentLeaveCourseSession(courseSessionId) {
      var route = SocketRoutes.STUDENT_LEFT + ':' + courseSessionId;
      socket.on(route, function (data) {
        $rootScope.$broadcast(route, { attendance: data.attendance });
      });
    }

    function handleQuestionDeleted(courseSessionId) {
      var routeOn = SocketRoutes.QUESTION_DELETED + ':' + courseSessionId;
      var routeEmit = SocketRoutes.QUESTION_DELETED + ':' + courseSessionId;
      socket.on(routeOn, function (data) {
        $rootScope.$broadcast(routeEmit, {
          questions: data.questions,
          dismissedQuestionId: data.dismissedQuestionId
        });
      });
    }

    function handleReflectiveAssessmentCreated(courseSessionId) {
      var routeOn = SocketRoutes.REFLECTIVE_ASSESSMENT_START + ':' + courseSessionId;
      var routeBroadcast = SocketRoutes.REFLECTIVE_ASSESSMENT_STARTED + ':' + courseSessionId;

      socket.on(routeOn, function (data) {
        $rootScope.$broadcast(routeBroadcast, data);
      });
    }

    function handleReflectiveAssessmentResponseStudent(courseSessionId) {
      var on = SocketRoutes.REFLECTIVE_ASSESSMENT_RESPONSE + ':' + courseSessionId;
      socket.on(on, function (data) {
        $rootScope.$broadcast('RA_RESPONSE_RECEIVED', data);
      });
    }

    function handleReflectiveAssessmentResponseInstructor(courseSessionId) {
      var on = SocketRoutes.RA_RESPONSE_NUMBER + ':' + courseSessionId;
      socket.on(on, function (data) {
        $rootScope.$broadcast('RA_RESPONSE_NUMBER', data);
      });
    }

    function handleReflectiveAssessmentStop(courseSessionId) {
      var route = SocketRoutes.REFLECTIVE_ASSESSMENT_STOP + ':' + courseSessionId;
      socket.on(route, function (data) {
        $rootScope.$broadcast(route, data);
      });
    }

    function handleInstantAssessmentStart(courseSessionId) {
      var routeOn = SocketRoutes.INSTANT_ASSESSMENT_START + ':' + courseSessionId;
      var routeBroadcast = SocketRoutes.INSTANT_ASSESSMENT_STARTED + ':' + courseSessionId;

      socket.on(routeOn, function (data) {
        $rootScope.$broadcast(routeBroadcast, data);
      });
    }

    function handleInstantAssessmentStop(courseSessionId) {
      var route = SocketRoutes.MC_STOP + ':' + courseSessionId;
      socket.on(route, function (data) {
        $rootScope.$broadcast(route, data);
      });
    }

    function handleMCSelectionMade(courseSessionId) {
      var on = SocketRoutes.MC_SELECTION_MADE + ':' + courseSessionId;
      socket.on(on, function (data) {
        $rootScope.$broadcast('INSTANT_ASSESSMENT_SELECTION', data);
      });
    }

    function handleReflectiveAssessmentResponseReviewed(courseSessionId) {
      var route = SocketRoutes.RA_RESPONSE_REVIEWED + ':' + courseSessionId;
      socket.on(route, function (data) {
        $rootScope.$broadcast('RA_RESPONSE_REVIEWED', data);
      });
    }

    function handleCourseSessionEnd(courseSessionId) {
      var route = SocketRoutes.COURSE_SESSION_END + ':' + courseSessionId;
      socket.on(route, function (data) {
        $rootScope.$broadcast('COURSE_SESSION_END', data);
      });
    }

    return self;
  }
})();
'use strict';

/** Author: Anthony Altieri **/

(function () {
  angular.module('app').factory('UserService', UserService);

  UserService.$inject = ['$rootScope', '$state', 'ServerService', 'UserRoutes'];

  function UserService($rootScope, $state, ServerService, UserRoutes) {
    var self = this;

    self.handleAlreadyLoggedIn = handleAlreadyLoggedIn;
    self.getUserType = getUserType;
    self.logOut = logOut;
    self.logIn = logIn;
    self.createAccount = createAccount;
    self.getUserInformation = getUserInformation;
    self.getId = getId;
    self.createInstructorAccount = createInstructorAccount;

    function getUserType(callback) {
      ServerService.post(UserRoutes.GET_TYPE, {}, function (responseSuccess) {
        var data = responseSuccess.data;
        var type = data.type;


        callback(type);
      }, function (responseFail) {});
    }

    function logOut() {
      ServerService.post(UserRoutes.LOG_OUT, {}, function (responseSuccess) {
        $state.go('launch.login');
        toastr.success('Successfully logged out');
      }, function (responseFail) {});
    }

    function logIn(email, password, callback) {
      if (!email) {
        toastr.error('Email is incorrect, try again', 'Login Failed');
        callback(false);
        return;
      }

      if (!password) {
        toastr.error('Password is incorrect, try again', 'Login Failed');
        callback(false);
        return;
      }

      ServerService.post(UserRoutes.LOG_IN, {
        email: email,
        password: password
      }, function (resSuccess) {
        var data = resSuccess.data;
        var success = data.success;
        var foundUser = data.foundUser;
        var name = data.name;
        var userType = data.userType;


        if (success) {
          $state.go('dash.courses.active');
        } else {
          if (foundUser) {
            toastr.error('Password incorrect');
            callback('ERROR_PASSWORD');
          } else {
            toastr.error('No account found for that email');
            callback('ERROR_EMAIL');
          }
        }
      }, function (resFail) {
        callback(null);
      });
    }

    function createAccount(email, password, firstName, lastName, callback) {
      if (!email || !email.trim()) {
        toastr.error('Enter a valid email');
        callback();
        return;
      }
      if (!password || !password.trim()) {
        toastr.error('Enter a valid password');
        callback();
        return;
      }
      if (!firstName || !firstName.trim()) {
        toastr.error('Enter a valid First Name');
        callback();
        return;
      }
      if (!lastName || lastName.trim('').length === 0) {
        toastr.error('Enter a valid Last Name');
        callback();
        return;
      }
      ServerService.post(UserRoutes.SIGN_UP, {
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        userType: 'STUDENT'
      }, function (resSuccess) {
        var data = resSuccess.data;
        var success = data.success;
        var msg = data.msg;


        if (success) {
          toastr.success('Account successfully created.');
          $state.go('dash.courses.active');
        } else {
          if (msg === 'Email in use') {
            toastr.error('Email in use, try another one.');
          } else if (msg === 'Server error') {}
        }
        callback();
      }, function (resFail) {
        callback();
      });
    }

    function getUserInformation() {
      return new Promise(function (resolve, reject) {
        ServerService.p(UserRoutes.GET_INFO, {}).then(function (data) {
          resolve(data);
        });
      });
    }

    function handleAlreadyLoggedIn(callback) {
      ServerService.post(UserRoutes.CHECK_FOR_VALID_SESSION, {}, function (resSuccess) {
        var data = resSuccess.data;
        var hasValidSession = data.hasValidSession;

        if (hasValidSession) {
          console.log("valid session");
          callback(true);
        } else {
          console.log("invalid session");
          callback(false);
        }
      }, function (resFail) {});
    }

    function getId() {
      return new Promise(function (resolve, reject) {
        ServerService.p(UserRoutes.ID_GET, {}).then(function (id) {
          resolve(id);
        });
      });
      // Todo: handle reject
    }

    function createInstructorAccount(email, password, firstName, lastName, courseCode, courseTitle, time, callback) {
      ServerService.post(UserRoutes.CREATE_INSTRUCTOR_ACCOUNT, {
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        courseCode: courseCode,
        courseTitle: courseTitle,
        time: time
      }, function (resSuccess) {
        var data = resSuccess.data;
        var success = data.success;
        var user = data.user;
        var course = data.course;
        var msg = data.msg;


        if (success) {
          toastr.success('Instructor Account & Course successfully created.');
          console.log(user);
          console.log(course);
        } else {
          if (msg === 'Email in use') {
            toastr.error('Email in use, try another one.');
          } else if (msg === 'Server error') {
            console.log("Server Error : " + msg);
          }
        }
        callback(user, course);
      }, function (resFail) {
        callback();
      });
    }

    return self;
  }
})();
'use strict';

/** Author: Anthony Altieri **/

(function () {
    angular.module('app').factory('CourseRoutes', CourseRoutes);

    function CourseRoutes() {
        var self = this;

        var prefix = '/api/course';

        self.CREATE = prefix + '/create';
        self.REMOVE = prefix + '/remove';

        // Active CourseSession
        self.ACTIVE_COURSESESSION_END = prefix + '/courseSession/active/end';
        self.COURSESESSION_ACTIVE_JOIN = prefix + '/courseSession/active/join';
        self.COURSESESSION_ACTIVATE_OR_JOIN = prefix + '/courseSession/activateOrJoin';
        self.COURSESESSION_ACTIVE_END = prefix + '/courseSession/active/end';

        // Register Student to Course
        self.REGISTER_STUDENT_TO_COURSE = prefix + '/register';

        // Accessors
        self.GET_ALL = prefix + '/get/all';
        self.GET_ENROLLED = prefix + '/get/enrolled';

        return self;
    }
})();
'use strict';

/** @author: Anthony Altieri **/

(function () {
  angular.module('app').factory('CourseSessionRoutes', CourseSessionRoutes);

  CourseSessionRoutes.$inject = [];

  function CourseSessionRoutes() {
    var self = this;

    var prefix = '/api/courseSession';

    // Students
    self.STUDENT_REMOVE = prefix + '/student/remove';

    // Attendance
    self.ATTENDANCE_GET = prefix + '/attendance/get';

    // Questions
    self.QUESTIONS_GET = prefix + '/questions/get';
    self.QUESTIONS_GET_OBJECTS = prefix + '/questions/getObjects';
    self.QUESTIONS_ADD = prefix + '/questions/add';
    self.QUESTIONS_VOTE = prefix + '/questions/vote';
    self.QUESTIONS_REMOVE = prefix + '/questions/remove';
    self.QUESTIONLIST_TOGGLE = prefix + '/questionList/toggle';
    self.QUESTIONLIST_IS_ACTIVE = prefix + '/questionList/isActive';

    // Alerts
    self.ALERTS_ADD = prefix + '/alerts/add';
    self.ALERTS_GET_NUMBER_ACTIVE = prefix + '/alerts/getNumberActive';
    self.ALERTS_GET_NUMBER_AND_PERCENT = prefix + '/alerts/getNumberAndPercent';
    self.ALERTS_SET_THRESHOLD = prefix + '/alerts/setThreshold';

    // Util
    self.LEAVE = prefix + '/leave';

    // Assessments
    self.ASSESSMENTS_GET_PRIOR_SELECTIONS = prefix + '/assessments/getPriorSelections';
    self.ASSESSMENTS_GET_PRIOR_ACTIVE = prefix + '/assessments/getPriorActive';

    return self;
  }
})();
'use strict';

/** Author: Anthony Altieri **/

var InstantAssessmentRoutes = new function () {
  this.prefix = '/api/instantAssessment';

  this.CREATE = this.prefix + '/create';
  this.CHOOSE_OPTION = this.prefix + '/chooseOption';
  this.STOP = this.prefix + '/stop';
  this.MARK_CORRECT_OPTION = this.prefix + '/select/correct';
}();
'use strict';

/** Author: Anthony Altieri **/

(function () {
    'use strict';

    angular.module('app').factory('ReflectiveAssessmentRoutes', ReflectiveAssessmentRoutes);

    ReflectiveAssessmentRoutes.$inject = [];

    function ReflectiveAssessmentRoutes() {
        var prefix = '/api/reflectiveAssessment';

        return {
            ADD: prefix + '/add',
            ADD_RESPONSE: prefix + '/add/response',
            GET: prefix + '/get',
            RESPOND: prefix + '/respond',
            VOTE_ON_RESPONSE: prefix + '/response/vote',
            STOP: prefix + '/stop'
        };
    }
})();
'use strict';

/** Author: Anthony Altieri **/

(function () {
  'use strict';

  angular.module('app').factory('SessionRoutes', SessionRoutes);

  function SessionRoutes() {}
})();
'use strict';

/** Author: Anthony Altieri **/

(function () {
    angular.module('app').factory('SocketRoutes', SocketRoutes);

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
            QUESTION_DISMISSED: 'QUESTION_DISMISSED',

            VOTED_ON_QUESTION: 'VOTED_ON_QUESTION',

            QUESTION_DELETED: 'QUESTION_DELETED'

        };
    }
})();
'use strict';

/** Author: Anthony Altieri **/

(function () {
  angular.module('app').factory('UserRoutes', UserRoutes);

  UserRoutes.$inject = [];

  function UserRoutes() {
    var prefix = '/api/user';

    return {
      LOG_IN: prefix + '/logIn',
      SIGN_UP: prefix + '/signUp',
      LOG_OUT: prefix + '/logOut',
      CHECK_FOR_VALID_SESSION: prefix + '/session/checkValid',
      GET_TYPE: prefix + '/getType',
      GET_INFO: prefix + '/getInfo',
      ID_GET: prefix + '/get/id',
      TEST: prefix + '/test',
      CREATE_INSTRUCTOR_ACCOUNT: '/api/admin' + '/createInstructorAccount'
    };
  }
})();
'use strict';

/** Author: Anthony Altieri **/

(function () {
  angular.module('app').factory('VoteType', VoteType);

  function VoteType() {
    return {
      SIMILAR: 'SIMILAR',
      DIFFERENT: 'DIFFERENT',
      UNKOWN: 'UNKOWN',
      UP: 'UP',
      DOWN: 'DOWN'
    };
  }
})();
//# sourceMappingURL=index.js.map
