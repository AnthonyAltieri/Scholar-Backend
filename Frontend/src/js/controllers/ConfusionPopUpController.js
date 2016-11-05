/**
 * Created by bharatbatra on 9/28/16.
 */
/** Author: Anthony Altieri **/

(() => {
    'use strict';

    angular
        .module('app')
        .controller('ConfusionPopUpController', ConfusionPopUpController);

    ConfusionPopUpController.$inject = [
        '$rootScope', '$scope', '$log', '$state', '$stateParams', '$interval', 'ServerService',
        'ReflectiveAssessmentRoutes', 'SocketService', 'SocketRoutes', 'CourseSessionRoutes',
        'CourseRoutes', 'CourseSessionService'
    ];

    function ConfusionPopUpController
    (
        $rootScope, $scope, $log, $state, $stateParams, $interval, ServerService, ReflectiveAssessmentRoutes,
        SocketService, SocketRoutes, CourseSessionRoutes, CourseRoutes, CourseSessionService
    ) {

        $rootScope.loading = false;

        let vm = this;
        vm.courseSession = {};

        let stateParams = readLocalStorage("stateParams");
        let intervalPromises = [];

        //Setup
        if(stateParams){
            init(vm, stateParams);
            //writeLocalStorage("sessionId", -1);
        }
        else {
            console.log("Error. no init variables");
        }

        //Overlay to confirm end session
        vm.showEndSessionOverlay = false;

        // Sockets
        // handleSockets(SocketService, vm.courseSession.id);

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
                courseId,
                code,
                isRAActive: false,
                activeAlerts: 0,
                confusionThreshold: readLocalStorage(courseSessionId+"-confusionThreshold"),
                recentDiscussionAnswers: []
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
        /*
         Angular-nvd3 Bar Graph Setup
         */
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
            console.log("no LS for graph found making new graph");

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
            console.log("found the LS for confusionGraph");
            vm.confusionGraph = confusionGraph;
        }

        // Update the clock every minute
        const promiseTime = $interval(() => {
            vm.confusionGraph = readLocalStorage(vm.courseSession.id+"-confusionData");
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
