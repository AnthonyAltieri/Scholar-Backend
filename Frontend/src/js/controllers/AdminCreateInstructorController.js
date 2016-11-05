/**
 * Created by bharatbatra on 9/16/16.
 */
/** Author: Anthony Altieri **/

(() => {
    'use strict';

    angular
        .module('app')
        .controller('AdminCreateInstructorController', AdminCreateInstructorController);

    AdminCreateInstructorController.$inject = [
        '$rootScope', '$state', 'ServerService', 'UserRoutes', 'UserService'
    ];

    function AdminCreateInstructorController
    (
        $rootScope, $state, ServerService, UserRoutes, UserService
    ) {
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

            const email = input.email.trim().toLocaleLowerCase();
            const {password, firstName, lastName, courseCode, courseTitle, time } = input;
            UserService.createInstructorAccount(email, password, firstName, lastName, courseCode, courseTitle, time, (user, course) => {
                vm.signingUp = false
                if(user && course){
                    vm.user=user;
                    vm.course=course;
                    vm.showInfo = true;
                }

            });
        }
    }

})();