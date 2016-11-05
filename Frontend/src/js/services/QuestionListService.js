(() => {
  angular
    .module('app')
    .factory('QuestionListService', QuestionListService);

  QuestionListService.$inject = ['ServerService', 'CourseSessionRoutes'];

  function QuestionListService(ServerService, CourseSessionRoutes) {
    const self = this;

    self.get = get;
      self.checkSimilarity = checkSimilarity;

      self.toggleQuestionList = toggleQuestionList;
      self.isQuestionListActive = isQuestionListActive;

      self.ML_SERVER = "http://54.70.189.112:8888";
      self.QUESTION_SIMILARITY_PATH = "/similarity";
      self.SIMILARITY_THRESHOLD = 0.7;

    function get(courseSessionId) {
      return new Promise((resolve, reject) => {
        ServerService.p(CourseSessionRoutes.QUESTIONS_GET, {courseSessionId})
          .then((data) => {
            const {success, questions} = data;
            if (success) {
              resolve(questions);
              return
            }
            reject(null)
          })
          .catch((response) => { reject(response) })
      });
    }

    /*
    Formats the questionlist into the desired form for similarity comparison
     */
    function formatQuestionList(questionList){
        let str = "";
        if(questionList){
            questionList.forEach(q => {
                str+=q.content;
                str+="%";
            });
        }

        return str;
    }


    function checkSimilarity(question, questionList, callback) {
      return new Promise((resolve, reject) => {
        ServerService.promisePostWithoutPrefix(self.ML_SERVER+self.QUESTION_SIMILARITY_PATH, JSON.stringify({string1: question, string2: formatQuestionList(questionList), threshold: 0.7 }))
        // ServerService.promisePostWithoutPrefix("http://localhost:8888/api/user/test", JSON.stringify({string1: question, string2: formatQuestionList(questionList), threshold: 0.7 }))
          .then((data) => {

              console.log("Server response");
              console.log(JSON.stringify(data,null,2));
              resolve(question);
              callback(data);
          })
          .catch((error) => {console.log("error " + error); reject( error); callback(-1) })
      });
    }

      function toggleQuestionList(courseSessionId){
          ServerService.p(CourseSessionRoutes.QUESTIONLIST_TOGGLE, { courseSessionId })
              .then((data) => {
                  if(data.success)
                  {
                      if(data.toggleValue===true)
                      {
                          toastr.success("Turned On The Question List!");
                      }
                      else{
                          toastr.success("Turned Off The Question List!");
                      }
                  }

              })
      }

      function isQuestionListActive(courseSessionId, callback){
          ServerService.p(CourseSessionRoutes.QUESTIONLIST_IS_ACTIVE, { courseSessionId } )
              .then( (data) => {
                  if(data.success)
                  {
                      console.log("Successful retrieval of Question List Status : ");
                      console.log(JSON.stringify(data, null, 2));
                      callback(data.isActive);
                  }
                  else {
                      console.log("Error getting the question list setting; default to active");
                      callback(true);//default setting
                  }
              })
      }

    return self;
  }


})();