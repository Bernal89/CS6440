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
            var allConditions = {};
            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Condition')
                .then(function(response) {

                    // Grab each condition and add it to the array, no duplicates
                    angular.forEach(response.data.entry, function(entry, index) {
                    
                        // Lets limit these to SNOMEDCT coded conditions
                        if (entry.resource.code.coding && entry.resource.code.coding.length > 0 &&
                            entry.resource.code.coding[0].system == "http://snomed.info/sct") {

                            var condition = {};
                            condition.code = entry.resource.code.coding[0].code;
                            condition.display = entry.resource.code.coding[0].display;
                            allConditions[condition.code] = condition;
                        }

                    });

                    for(var key in allConditions){
                        listService.conditionList.push(allConditions[key]);
                    }

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
            var deferred = $q.defer();
            listService.patientData = [];

            // WHEN patientList is referenced here it appears to be empty?????

            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Patient')
                .success(function(response) {
                    $log.info(response);

                    // Grab each condition and add it to the array, no duplicates
                    if (response && response.entry) {
                        angular.forEach(response.entry, function(entry, index) {
                            if (patients && patients.indexOf(entry.fullUrl) == -1) {

                            }else{
                                listService.patientData.push(entry);
                            }
                        });
                    }
                    deferred.resolve(listService.patientData);
                }).error(function(error){
                    deferred.reject(error);
                });
            return deferred.promise;
        };


        listService.getConditionPatients = function(conditionCode){

            var deferred = $q.defer();
            var patients = [];

            listService.patientData = [];

            // Get all instances of the given condition
            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Condition?code='+conditionCode)
                .success(function(response) {

                    if (response && response.entry) {
                        angular.forEach(response.entry, function(entry, index) {
                            patients.push(entry.resource.patient.reference);
                        });
                    }
                }).error(function(error){
                    deferred.reject(error);
                }).then(function(){

                    // For each patient with the condition, get their city and state
                    for (var i = patients.length - 1; i >= 0; i--) {
                        $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/' + patients[i])
                            .success(function(data){
                                if (data && data.address && data.address.length > 0) {
                                    listService.patientData.push(
                                        {
                                            "city": data.address[0].city,
                                            "state": data.address[0].state  
                                        }
                                    );
                                }
                            }).then(function(){
                                //If this is the last item, resolve the promise
                                if (listService.patientData.length == patients.length) {
                                    deferred.resolve(listService.patientData);
                                }
                            });
                    }
                });
            return deferred.promise;
        };

        listService.getLocationCoordinates = function(state, city){
            var deferred = $q.defer();

            $http.get('/components/cities3.json').success(function(response){

                // Get the coordinates of the given city
                for (var i = response.length - 1; i >= 0; i--) {
                    if(response[i].state == state && response[i].city == city){
                        deferred.resolve(
                            {
                                "city": city,
                                "desc": "",
                                "lat": response[i].lat,
                                "long": response[i].long
                            }
                        );
                    }
                }
            }).error(function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };

        return listService;

    });


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