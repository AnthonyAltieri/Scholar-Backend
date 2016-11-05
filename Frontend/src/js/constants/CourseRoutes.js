/** Author: Anthony Altieri **/

(() => {
    angular
        .module('app')
        .factory('CourseRoutes', CourseRoutes);
        
    function CourseRoutes() {
      const self = this;

      const prefix = '/api/course';

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
