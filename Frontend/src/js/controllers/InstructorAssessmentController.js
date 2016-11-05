(() => {
  angular
    .module('app')
    .controller('InstructorAssessmentController', InstructorAssessmentController);

  InstructorAssessmentController.$inject = [ '$rootScope', '$scope', 'ServerService',
    'ReflectiveAssessmentRoutes', 'CourseSessionRoutes'
  ];

  function InstructorAssessmentController(
    $rootScope, $scope, ServerService, ReflectiveAssessmentRoutes, CourseSessionRoutes
  ) {
    const vm = this;

    vm.select = select;
    vm.proposeOrStop = proposeOrStop;

    // Default
    vm.selected = 'INSTANT';
    vm.active = null;
    vm.activationLoading = false;
    vm.last = '';
    vm.topReflectiveResponses = [];

    function proposeOrStop (courseSessionId, question, options, selectedType, activeId, activeType) {
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
      ServerService.p(ReflectiveAssessmentRoutes.ADD, {courseSessionId, questionContent})
        .then((data) => {
          const {success, id, question} = data;
          if (success) {
            vm.active = generateActiveAssessment(id, 'REFLECTIVE', question);
            $scope.$broadcast('ASSESSMENT_ACTIVATED', {})
          }
          vm.activationLoading = false;
        })
    }

    function activateInstantAssessment(courseSessionId, content, options) {

      ServerService.p(InstantAssessmentRoutes.CREATE, {courseSessionId, content, options })
        .then((data) => {
          const {success, instantAssessmentId} = data;
          if (success) {
            vm.active = generateActiveAssessment(instantAssessmentId, 'INSTANT', content);
            $scope.$emit('ASSESSMENT_ACTIVATED', {activeAssessmentId : instantAssessmentId});
            $scope.$broadcast('ASSESSMENT_ACTIVATED', {activeAssessmentId: instantAssessmentId})
          }
          vm.activationLoading = false;
        })
    }

    function generateActiveAssessment(id, type, question = '') {
      return {
        id,
        type,
        question,
        responses: []
      }
    }

    function stopReflectiveAssessment(courseSessionId, reflectiveAssessmentId) {
      ServerService.p(ReflectiveAssessmentRoutes.STOP, {courseSessionId, reflectiveAssessmentId})
        .then((data) => {
          const {success, top} = data;
          if (success) {
            vm.active = null;
            vm.last = 'REFLECTIVE';
            vm.topReflectiveResponses = top;
            top.forEach(res => {
              res.numUpvotes = 0;
              res.votes.forEach(vote=>{
                if(vote.type==='UP'){
                  res.numUpvotes++;
                }
              });
            });
            $scope.$broadcast('ASSESSMENT_STOPPED', {});
          }
          vm.activationLoading = false;
        })
    }

    function stopInstantAssessment(courseSessionId, instantAssessmentId) {
      ServerService.p(InstantAssessmentRoutes.STOP, { courseSessionId, instantAssessmentId })
        .then((data) => {
          const { success } = data;
          if (success) {
            vm.active = null;
            vm.last = 'INSTANT';
            $scope.$broadcast('ASSESSMENT_STOPPED', {top});
          }
          vm.activationLoading = false;
        })
    }

    function select(type) {
      vm.selected = type;
    }


    function activateCurrentAssessment(courseSessionId, question, options, selection) {
      vm.topReflectiveResponses = [];
      switch (selection) {
        case 'REFLECTIVE': {
          activateReflectiveAssessment(courseSessionId, question);
          break
        }
        case 'INSTANT': {
          activateInstantAssessment(courseSessionId, question, options);
          break
        }
      }
    }

    function stopActiveAssessment(courseSessionId, assessmentId, type) {
      switch (type) {
        case 'REFLECTIVE': {
          stopReflectiveAssessment(courseSessionId, assessmentId);
          break
        }
        case 'INSTANT': {
          stopInstantAssessment(courseSessionId, assessmentId);
          break
        }
      }
    }

    function getPriorAssessments(courseSessionId) {
      ServerService.p(CourseSessionRoutes.ASSESSMENTS_GET_PRIOR_ACTIVE, { courseSessionId })
        .then((data) => {
          const { success, hasActiveAssessment, type, id, question } = data;
          if (success && hasActiveAssessment) {
            vm.active = generateActiveAssessment(id, type, question);
            vm.selected = type;
          }
        })
    }

    $scope.$on('USE_FOR_ASSESSMENT', (event, data) => {
      const { courseSessionId, content } = data;
      activateReflectiveAssessment(courseSessionId, content);
    });

    $scope.$on('COURSESESSION_JOINED_ASSESSMENT', (event, data) => {
      const { courseSessionId } = data;
      getPriorAssessments(courseSessionId);
    });

    $scope.$on('QUESTIONS_USE_FOR_ASSESSMENT', (event, data) => {
      const {courseSessionId, content} = data;
      activateReflectiveAssessment(courseSessionId, content);
    });

    $scope.$emit('ASSESSMENT_INIT', {});
  }
})();