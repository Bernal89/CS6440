// app.controllers.js
/* Controllers */

    // create the module and name it fihrballControllers
    var fihrballControllers = angular.module('fihrballControllers', []);

    // create the controller and inject Angular's $scope
    fihrballControllers.controller('mainController', function($scope) {
        $scope.message = 'Everyone come and see how good I look!';
    });

    fihrballControllers.controller('listController', function($scope, $http) {
            $scope.message = 'This page shows the conditions available.';

            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Condition').
                success(function(data) {
                    $scope.condition = data;
                });
        });

    fihrballControllers.controller('searchController', function($scope) {
        $scope.message = 'This is the search page.';
    });

    fihrballControllers.controller('reportsController', function($scope) {
        $scope.message = 'This is the reports page.';
    });

    fihrballControllers.controller('aboutController', function($scope) {
        $scope.message = 'Look! I am an about page.';
    });
