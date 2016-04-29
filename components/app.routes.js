// app.routes.js

    // create the module and name it fihrballApp
    var fihrballApp = angular.module('fihrballApp', [
      'ngRoute',
      'fihrballControllers',
      'ui.bootstrap',
      'ngAnimate',
      'chart.js',
      'treasure-overlay-spinner'
    ]);


    fihrballApp.factory('List', function($rootScope, $http, $q, $window) {
        var listService = {
            conditionList: [],
            patientList: [],
            patientData: []
        };

        listService.getList = function(){
            listService.conditionList = [];
            var allConditions = {};
            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Condition?_count=400')
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
            count = 0;
            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Condition?_count=400')
                .then(function (response) {
                    var patientList = [];
                    angular.forEach(response.data.entry, function (entry, index) {
                        if (entry.resource.code.coding[0].display == text && listService.patientList.indexOf("http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/" +
                                entry.resource.patient.reference)== -1) {
                            listService.patientList.push("http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/" +
                                entry.resource.patient.reference);
                        }
                    });
                });
            return listService.patientList;
        };

        listService.getConnectData = function(patients){
            listService.patientData = [];
            // WHEN patientList is referenced here it appears to be empty?????
            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Patient?_count=400')
                .then(function(response) {
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

            $http.get('components/cities.json').success(function(response){

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

        listService.getChartData = function(patients){
            var patientStats = {
                currentYear: 2016,
                male: 0,
                female: 0,
                under18: 0,
                upto30: 0,
                over30: 0,
                over50: 0,
                northeast: 0,
                south: 0,
                midwest: 0,
                west: 0,
                other: 0
            };

            var Northeast = ['CT', 'DE', 'ME', 'MD', 'MA', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT'];
            var South = ['AL', 'AR', 'FL', 'GA', 'KY', 'LA', 'MS', 'NC', 'OK', 'SC', 'TN', 'TX', 'VA', 'WV'];
            var Midwest = ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI'];
            var West = ['AZ', 'CA', 'CO', 'ID', 'MT', 'NV', 'NM', 'OR', 'UT', 'WA', 'WY'];

            // WHEN patientList is referenced here it appears to be empty?????
            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Patient?_count=400')
                .then(function(response) {
                    // Grab each condition and add it to the array, no duplicates
                    angular.forEach(response.data.entry, function(entry, index) {
                        address = entry.resource.address[0]
                        if (patients.indexOf(entry.fullUrl) == -1) {
                            //do nothing
                        }else{
                            listService.patientData.push(entry);

                            if (entry.resource.gender == "male"){patientStats.male++}
                            else {patientStats.female++}

                            var year = entry.resource.birthDate.slice(0,4)
                            var age = parseInt(year , 10)
                            age = patientStats.currentYear - age
                            if (age <= 18){patientStats.under18++}
                            else if (age > 18 && age <= 30){patientStats.upto30++}
                            else if (age > 30 && age <= 50){patientStats.over30++}
                            else {patientStats.over50++}

                            if (Northeast.indexOf(address.state) >= 1){patientStats.northeast++}
                            else if (South.indexOf(address.state) >= 1){patientStats.south++}
                            else if (Midwest.indexOf(address.state) >= 1){patientStats.midwest++}
                            else if (West.indexOf(address.state) >= 1){patientStats.west++}
                            else {patientStats.other++}


                        }
                    });
                });
            return patientStats;
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
        })
        // route for connect page
          .when('/connect', {
              templateUrl: 'components/connect/connect.html',
              controller: 'connectController'
          });

    });