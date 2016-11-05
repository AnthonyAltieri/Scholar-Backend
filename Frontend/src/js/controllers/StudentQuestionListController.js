/** @author Anthony Altieri **/

;(() => {
  angular
    .module('app')
    .controller('StudentQuestionListController', StudentQuestionListController);

  StudentQuestionListController.$inject = [
    '$rootScope', '$scope', 'ServerService', 'VoteType', 'CourseSessionRoutes', 'CourseSessionService',
    'SocketRoutes', 'SocketService'
  ];

  function StudentQuestionListController
  (
    $rootScope, $scope, ServerService, VoteType, CourseSessionRoutes, CourseSessionService, SocketRoutes,
    SocketService
  ) {
    const vm = this;

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
      const userVote = votes.filter(v => v.userId.toString() === userId.toString())[0];
      return userVote && !isLoading
    }
    
    function isInactiveThumbFadeOut(votes, isLoading, userId) {
      const userVote = votes.filter(v => v.userId.toString() === userId.toString())[0];
      return (userVote && !isLoading) || isLoading
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
      const userVote = question.votes.filter(v => v.userId.toString() === userId.toString())[0];
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
      const userVote = question.votes.filter(v => v.userId.toString() === userId.toString())[0];
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
      const vote = {
        type,
        created: new Date()
      };

      ServerService.post(CourseSessionRoutes.QUESTIONS_VOTE,
        {
          type,
          courseSessionId,
          vote,
          questionId: question._id,
          questionUserId: question.userId,
        }, resSuccess => {
          const { data } = resSuccess;
          const { success } = data;

          if (!success) {
            toastr.error('Error voting on question');
          }
          question.loading = false;
        }, resFail => {}
      )
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
    function filterQuestions(filter, questions = []) {
      switch (filter) {
        case 'MOST_RECENT':
          return  questions
            .sort((lhs, rhs) => {
              const lhsDate = new Date(Date.parse(lhs.created));
              const rhsDate = new Date(Date.parse(rhs.created));
              if (lhsDate < rhsDate) {
                return 1;
              } else if (lhsDate > rhsDate) {
                return -1;
              } else {
                return 0;
              }
            });

        case 'MOST_VOTED':
          return questions.sort((lhs, rhs) => rhs.votes.length - lhs.votes.length);

        case 'ME':
          return filterQuestions('MOST_RECENT', questions)
            .filter(q => q.userId.toString() === vm.userId.toString());
      }
    }

    function init(vm) {
      vm.filter = 'MOST_VOTED';
    }


    $scope.$on('QUESTION_ADDED', (event, data) => {
      const { questions } = data;
      vm.all = questions;
      $scope.$emit('QUESTION_LIST_AVAILABLE', vm.all);
      vm.visible = filterQuestions(vm.filter, questions);
      try{
        $scope.$apply();
      }
      catch(err){
        console.log("DIgest err: " + err);
      }
    });

    $scope.$on('QUESTION_VOTE', (event, data) => {
      const { questionId, vote } = data;
      const indexAll = vm.all.findIndex(q => q._id.toString() === questionId.toString());
      switch (vote.type) {
        case 'UP': {
          vm.all[indexAll].votes = [...vm.all[indexAll].votes, vote];
          console.log(JSON.stringify(vm.all[indexAll], null, 2));
          break;
        }
        case 'DOWN': {
          vm.all[indexAll].votes = vm.all[indexAll].votes.filter(v => (
            v.userId.toString() !== vote.userId.toString()
          ))
        }
      }
      $scope.$emit('QUESTION_LIST_AVAILABLE', vm.all);
      vm.visible = filterQuestions(vm.filter, vm.all);
      try {
        $scope.$apply();
      }
      catch(err){
        console.log("Digest Cycle Error : " + err);
      }
    });

    $scope.$on('QUESTION_DISMISSED', (event, data) => {
      const { questions } = data;

      vm.all = questions;
      vm.visible = filterQuestions(vm.filter, vm.all);
      $scope.$emit('QUESTION_LIST_AVAILABLE', vm.all);
      try{
        $scope.$apply();
      }
      catch(err){
        console.log("DIgest err: " + err);
      }
    });

    $scope.$on('INIT_QUESTION_LIST', (event, data) => {
      const { courseSessionId, userId } = data;
      vm.courseSessionId = courseSessionId;
      vm.userId = userId;

      SocketService.handleQuestionAdded(courseSessionId);
      SocketService.handleQuestionDismissed(courseSessionId);
      SocketService.handleQuestionVote(courseSessionId);

      CourseSessionService.getQuestions(courseSessionId)
        .then((questions) => {
          vm.all = questions;
          vm.visible = filterQuestions(vm.filter, vm.all);
          vm.loading = false;
          $scope.$emit('QUESTION_LIST_AVAILABLE', vm.all);
          try{
            $scope.$apply();
          }
          catch(err){
            console.log("DIgest err: " + err);
          }
        })
        .catch((error) => { vm.loading = false })


    });

    $scope.$on('SIMILAR_QUESTION_ATTEMPTED', (event, data) => {
      const {question, courseSessionId, userId} = data;
      toastr.info("Found a similar question to your input. Upvoting it for you!")
      voteUp(question,courseSessionId,userId);
    });

    $scope.$emit('QUESTION_LIST_INIT', {} );
  }
})();