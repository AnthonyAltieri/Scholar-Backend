/**
 * Created by bharatbatra on 9/28/16.
 */
/** Author: Anthony Altieri **/

(() => {
    'use strict';

    angular
        .module('app')
        .controller('MCQPopUpController', MCQPopUpController);

    MCQPopUpController.$inject = [
        '$rootScope', '$scope', '$log', '$state', '$stateParams', '$interval', 'ServerService',
        'ReflectiveAssessmentRoutes', 'SocketService', 'SocketRoutes', 'CourseSessionRoutes',
        'CourseRoutes', 'CourseSessionService', 'InstantAssessmentService'
    ];

    function MCQPopUpController
    (
        $rootScope, $scope, $log, $state, $stateParams, $interval, ServerService, ReflectiveAssessmentRoutes,
        SocketService, SocketRoutes, CourseSessionRoutes, CourseRoutes, CourseSessionService, InstantAssessmentService
    ) {

        $rootScope.loading = false;

        let vm = this;
        vm.courseSession = {};
        vm.activeAssessmentId = null;//set by reading localStorage

        let stateParams = readLocalStorage("stateParams");
        let intervalPromises = [];

        //Setup
        if(stateParams){
            init(vm, stateParams);
        }
        else {
            console.log("Error. no init variables");
        }

        //Overlay to confirm end session
        vm.showEndSessionOverlay = false;

        // Sockets
        handleSockets(SocketService, vm.courseSession.id);

        function init(vm, stateParams) {
            writeLocalStorage("stateParams", stateParams);
            const { courseSessionId, code, courseId, instructorName } = stateParams.data;
            initCourseSession(vm, courseSessionId, code, courseId);
            getAttendance(courseSessionId)
                .then((attendance) => { vm.courseSession.attendance = attendance });
            ServerService.p(CourseSessionRoutes.ALERTS_GET_NUMBER_ACTIVE, {})
                .then((data) => {
                    const { success, activeAlerts } = data;
                    if (success) {
                        vm.courseSession.activeAlerts = activeAlerts;
                    }
                })
                .catch((error) => {});
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
                courseId,
                code,
                isRAActive: false,
                activeAlerts: 0,
                confusionThreshold: 20,
                recentDiscussionAnswers: []
            };
        }

        function initAssessmentGraph(courseSessionId){
            vm.instantAssessmentGraph = {};
            vm.instantAssessmentGraph.data = readLocalStorage(courseSessionId+"-mcqData");
            if(vm.instantAssessmentGraph.data){
                console.log("found the graph data");
            }else{
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

            }
            //Graph Config
            vm.instantAssessmentGraph.options = {
                chart: {
                    type: 'discreteBarChart',
                    height: 300,
                    width: 425,//TODO: FIGURE OUT HOW TO MAKE THESE RESPONSIVE
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
                        console.log("mcq graph callback");
                        d3.selectAll("rect").on('click', function (e,i, nodes) {
                            console.log(JSON.stringify(i, null, 2));
                            /*
                            Experimentally observed index conversion
                             */
                             
                            let correctIndex = i-1;

                            if(correctIndex>=0&&correctIndex<5) {

                            InstantAssessmentService.markCorrectOption(vm.activeAssessmentId, correctIndex);
                            }

                        });
                    }
                }
            };
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
                }, resFail => {console.log("failed miserably")});
            })
        }

        function handleSockets(SocketService, courseSessionId) {
            console.log("handles sockets id: " + courseSessionId);
            SocketService.handleStudentJoinedCourseSession(courseSessionId);
            SocketService.handleStudentLeaveCourseSession(courseSessionId);
            SocketService.handleReflectiveAssessmentResponseInstructor(courseSessionId);
            SocketService.handleMCSelectionMade(courseSessionId);
            SocketService.handleReflectiveAssessmentResponseReviewed(courseSessionId);
        }

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

        // Update the clock every minute
        const promiseTime = $interval(() => {
            vm.activeAssessmentId = readLocalStorage(vm.courseSession.id+"-activeAssessmentId");
            // $scope.$apply();
        }, 1000);
        intervalPromises.push(promiseTime);


        $scope.$on('$destroy', () => {
            intervalPromises.forEach(p => {
                $interval.cancel(p);
            })
        });

    }




})();
