/** Author: Anthony Altieri **/

var InstantAssessmentRoutes = new function() {
  this.prefix = '/api/instantAssessment';
  
  this.CREATE = this.prefix + '/create';
  this.CHOOSE_OPTION = this.prefix + '/chooseOption';
  this.STOP = this.prefix + '/stop';
  this.MARK_CORRECT_OPTION = this.prefix + '/select/correct'
};
  
