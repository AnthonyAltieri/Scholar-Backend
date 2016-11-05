/** Author: Anthony Altieri **/

(()=> {
  angular
    .module('app')
    .factory('InstantAssessmentService', InstantAssessmentService);
  
  InstantAssessmentService.$inject = ['ServerService'];
  
  function InstantAssessmentService(ServerService) {
    const self = this;
    
    self.clickOption = clickOption;
    self.markCorrectOption = markCorrectOption;
    
    function clickOption(optionIndex, currentSelection, instantAssessmentId, courseSessionId, callback) {
      const newSelection = determineSelectedOption(optionIndex, currentSelection);
      const answerType = (!newSelection) ? 'UNSELECT' : 'SELECT';
      
      ServerService.post(InstantAssessmentRoutes.CHOOSE_OPTION,
        {
          answerType,
          optionIndex,
          instantAssessmentId,
          courseSessionId
        },
        resSuccess => {
          const { data } = resSuccess;
          const { success } = data;
          
          if (success) {
            callback(null, newSelection);
          } else {
            callback('Server Error', null)
          }
        },
        resFail => {
          callback('Server Error', null)
        }
      )
    }
    
    function determineSelectedOption(index, currentSelection) {
      switch (index) {
        case 0:
          return (notSelected('A', currentSelection))
            ? 'A'
            : null;
        case 1:
          return (notSelected('B', currentSelection))
            ? 'B'
            : null;
        case 2:
          return (notSelected('C', currentSelection))
            ? 'C'
            : null;
        case 3:
          return (notSelected('D', currentSelection))
            ? 'D'
            : null;
        case 4:
          return (notSelected('E', currentSelection))
            ? 'E'
            : null;
      }
    }


    function notSelected(selection, optionSelected) {
      return optionSelected === null || optionSelected !== selection
    }

    function markCorrectOption(instantAssessmentId, correctIndex){
      ServerService.post(InstantAssessmentRoutes.MARK_CORRECT_OPTION,
          {
            instantAssessmentId,
            correctIndex
          },
          resSuccess => {
            const { data } = resSuccess;
            const { success } = data;
            console.log("Success : "  + data);
            if (success) {
              let correctChar = 'Unknown';
              switch(correctIndex){
                case 0: correctChar = 'A'; break;
                case 1: correctChar = 'B'; break;
                case 2: correctChar = 'C'; break;
                case 3: correctChar = 'D'; break;
                case 4: correctChar = 'E'; break;
              }
              toastr.success("Selected " + correctChar + " as the Correct Answer! ");
            } else {
              toastr.error("Server error; Couldn't set the right answer");
            }
          },
          resFail => {
            callback('Server Error', null)
          }
      )
    }
    
    return self
  }
  
})();