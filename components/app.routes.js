// app.routes.js

    // create the module and name it fihrballApp
    var fihrballApp = angular.module('fihrballApp', [
      'ngRoute',
      'fihrballControllers',
      'ui.bootstrap',
      'ngAnimate'
    ]);

    fihrballApp.factory('List', function($rootScope, $http, $q, $log) {
        var listService = {
            conditionList: [],
            patientList: [],
            patientData: []
        };

        listService.getList = function(){
            listService.conditionList = [];
            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Condition')
                .then(function(response) {
                    // Grab each condition and add it to the array, no duplicates
                    angular.forEach(response.data.entry, function(entry, index) {
                        if (listService.conditionList.indexOf(entry.resource.notes) == -1) {
                            listService.conditionList.push(entry.resource.notes);
                        }
                    });
                });
            return listService.conditionList;
        };

        listService.getPatients = function(text) {
            listService.patientList = [];
            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Condition')
                .then(function (response) {
                    var patientList = [];
                    // Grab each condition and add it to the array, no duplicates
                    angular.forEach(response.data.entry, function (entry, index) {
                        if (entry.resource.notes == text && listService.patientList.indexOf("http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/" +
                                entry.resource.patient.reference)== -1) {
                            listService.patientList.push("http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/" +
                                entry.resource.patient.reference);
                        }
                    });
                });
            return listService.patientList;
        };

        listService.getData = function(patients){
            listService.patientData = [];
            // WHEN patientList is referenced here it appears to be empty?????
            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Patient')
                .then(function(response) {
                    $log.info(response);
                    // Grab each condition and add it to the array, no duplicates
                    angular.forEach(response.data.entry, function(entry, index) {
                        if (patients.indexOf(entry.fullUrl) == -1) {
                            //do nothing
                        }else{
                            listService.patientData.push(entry);
                        }
                    });
                });
            return listService.patientData;
        };

        return listService;
    });

    //fihrballApp.factory('List', function($rootScope, $http) {
    //    return {
    //        getList: function(){
    //            list = [];
    //            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Condition')
    //                .success(function(data) {
    //                    // Grab each condition and add it to the array, no duplicates
    //                    angular.forEach(data.entry, function(entry, index) {
    //                        if (list.indexOf(entry.resource.notes) == -1) {
    //                            list.push(entry.resource.notes);
    //                        }
    //                    });
    //                });
    //            return list;
    //        },
    //        getPatients: function(text) {
    //            var patientList = [];
    //            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Condition')
    //                .success(function (data) {
    //                    // Grab each condition and add it to the array, no duplicates
    //                    angular.forEach(data.entry, function (entry, index) {
    //                        if (entry.resource.notes == text) {
    //                            patientList.push("http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/" +
    //                                entry.resource.patient.reference);
    //                        }
    //                    });
    //                });
    //            return patientList;
    //        },
    //        getData: function(patients){
    //            var patientData = [];
    //            // WHEN patientList is referenced here it appears to be empty?????
    //            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Patient')
    //                .success(function(data) {
    //                    // Grab each condition and add it to the array, no duplicates
    //                    angular.forEach(data.entry, function(entry, index) {
    //                        if (patients.indexOf(entry.fullUrl) == -1) {
    //                            patientData.push(entry);
    //                        }
    //                    });
    //                });
    //            return patientData;
    //        }
    //    }
    //});

    // configure the routes
    fihrballApp.config(function($routeProvider) {
      $routeProvider

      // route for home page
        .when('/', {
          templateUrl : 'components/home/home.html',
          controller	: 'mainController'
        })

        // route for list page
        .when('/list', {
          templateUrl : 'components/list/list.html',
          controller	: 'listController'
        })

        // route for search page
        .when('/search', {
          templateUrl : 'components/search/search.html',
          controller	: 'searchController'
        })

        // route for reports page
        .when('/reports', {
          templateUrl : 'components/reports/reports.html',
          controller	: 'reportsController'
        })

        // route for about page
        .when('/about', {
          templateUrl: 'components/about/about.html',
          controller: 'aboutController'
        });

    });