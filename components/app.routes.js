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
            count = 0;
            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Condition?_count=400')
                .then(function(response) {
                    // Grab each condition and add it to the array, no duplicates
                    angular.forEach(response.data.entry, function(entry, index) {
                        count = count + 1
                        if (listService.conditionList.indexOf(entry.resource.notes) == -1) {
                            listService.conditionList.push(entry.resource.notes);
                        }
                        //console.log(count)
                    });
                });
            return listService.conditionList;
        };

        listService.getPatients = function(text) {
            listService.patientList = [];
            count = 0;
            $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Condition?_count=400')
                .then(function (response) {
                    var patientList = [];
                    // Grab each condition and add it to the array, no duplicates
                    angular.forEach(response.data.entry, function (entry, index) {
                        //console.log(count++)
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