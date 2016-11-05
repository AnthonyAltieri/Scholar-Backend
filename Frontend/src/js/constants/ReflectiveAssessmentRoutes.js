/** Author: Anthony Altieri **/

(() => {
    'use strict';

    angular
      .module('app')
      .factory('ReflectiveAssessmentRoutes', ReflectiveAssessmentRoutes);

    ReflectiveAssessmentRoutes.$inject = [];

    function ReflectiveAssessmentRoutes() {
        const prefix = '/api/reflectiveAssessment';

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