// app.controllers.js
/* Controllers */

    // create the module and name it fihrballControllers
    var fihrballControllers = angular.module('fihrballControllers', []);

    // create the controller and inject Angular's $scope
    fihrballControllers.controller('mainController', function($scope) {
        $scope.message = 'Welcome to Team FHIRBall Population Health Project App!';
    });

    fihrballControllers.controller('listController', function($scope, $http, List) {

        $scope.message = 'This page shows the conditions available.';

        $scope.list = List.getList();
    });

    fihrballControllers.controller('searchController', function($scope, $http, $log, List) {
        $scope.message = 'This is the search page.';

        $scope.spinner = {
            active: false,
            on: function () {
                this.active = true;
            },
            off: function () {
                this.active = false;
            }
        };

        $scope.list = List.getList();

        var mapOptions = {
            zoom: 4,
            center: new google.maps.LatLng(40.0000, -98.0000),
            mapTypeId: google.maps.MapTypeId.TERRAIN
        };

        $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

        $scope.markers = [];

        var infoWindow = new google.maps.InfoWindow();

        var createMarker = function (info){

            var marker = new google.maps.Marker({
                map: $scope.map,
                position: new google.maps.LatLng(info.lat, info.long),
                title: info.city
            });
            marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';

            google.maps.event.addListener(marker, 'click', function(){
                infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
                infoWindow.open($scope.map, marker);
            });

            $scope.markers.push(marker);

        };

        $scope.openInfoWindow = function(e, selectedMarker){
            e.preventDefault();
            google.maps.event.trigger(selectedMarker, 'click');
        };

        $scope.getConditionPatients = function(){
            $scope.spinner.on()
            $scope.cities = [];

            // Clear Map
            for (var i = $scope.markers.length - 1; i >= 0; i--) {
                $scope.markers[i].setMap(null);
            }
            $scope.markers.length = 0;

            // Get all patients with the chosen condition
            List.getConditionPatients($scope.model.condition.code).then(function(data){

                // For each patient, get the coordinates of their city
                for (var i = data.length - 1; i >= 0; i--) {
                    List.getLocationCoordinates(data[i].state, data[i].city)
                        .then(function(city){

                            $scope.cities.push(city);

                            if($scope.cities.length == data.length){

                                for (i = 0; i < $scope.cities.length; i++){
                                    createMarker($scope.cities[i]);
                                }
                            }

                            $log.info("I'm done!");
                            $scope.spinner.off()
                        });
                }

            });
        };

    });

    fihrballControllers.controller('reportsController', function($scope, $http, $q, $timeout, List) {
    $scope.message = 'This is the reports page.';

    $scope.list = List.getList();

    var text;

    $scope.spinner = {
        active: false,
        on: function () {
            this.active = true;
        },
        off: function () {
            this.active = false;
        }
    };

    $scope.pielabels = ["Male", "Female"];
    $scope.piedata = [0, 0];

    $scope.ageseries = ['Series A']
    $scope.agelabels = ['Under 18', '18 to 30', '31 to 50', 'Over 50'];
    $scope.agedata =[[0, 0, 0, 0]];

    $scope.regionlabels = ["Northeast", "South", "Midwest", "West", "Other"];
    $scope.regiondata = [0, 0, 0, 0, 0];

    $scope.patientData = {}

    $scope.changedValue = function(input){
        $scope.spinner.on()
        text = input;
        console.log($scope.selectedItem);
        $q.when()
            .then(function () {
                var deferred = $q.defer();
                $scope.patientList = List.getPatients(text);
                patients = $scope.patientList;
                $timeout(function () { deferred.resolve("bar"); }, 5000);
                return deferred.promise;
            })
            .then(function (data) {
                $q.when()
                    .then(function () {
                        var deferred = $q.defer();
                        $scope.patientData = List.getChartData(patients);
                        $timeout(function () { deferred.resolve("bar"); }, 5000);
                        return deferred.promise;
                    })
                    .then(function (data) {
                        console.log($scope.patientData)
                        $scope.piedata = [$scope.patientData.male, $scope.patientData.female];
                        $scope.agedata = [[$scope.patientData.under18, $scope.patientData.upto30, $scope.patientData.over30, $scope.patientData.over50]];
                        $scope.regiondata = [$scope.patientData.northeast, $scope.patientData.south, $scope.patientData.midwest, $scope.patientData.west, $scope.patientData.other];
                        $scope.spinner.off();
                    })
            })
    }
});

    fihrballControllers.controller('connectController', function($scope, $http, $q, $timeout, List) {
        $scope.message = 'Connect to Patients';

        $scope.list = List.getList();

        var text;

        $scope.spinner = {
            active: false,
            on: function () {
                this.active = true;
            },
            off: function () {
                this.active = false;
            }
        };

        $scope.changedValue = function(input){
            $scope.spinner.on();
            text = input;
            console.log($scope.selectedItem.display);
            $q.when()
                .then(function () {
                    var deferred = $q.defer();
                    $scope.patientList = List.getPatients(text);
                    patients = $scope.patientList;
                    $timeout(function () { deferred.resolve("bar"); }, 5000);
                    return deferred.promise;
                })
                .then(function (data) {
                    $scope.patientData = List.getConnectData(patients);
                    $scope.spinner.off();
                })

        }

        $scope.selected = [];

        $scope.toggle = function (item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) list.splice(idx, 1);
            else list.push(item);

        }

        $scope.exists = function (item, list) {
            return list.indexOf(item) > -1;
        }

        $scope.checkSelection = function() {
            if ($scope.selected.length > 0)
                return false
            else
                return true
        };
        $scope.sendEmail = function(data) {
            emailds="";
            selected=$scope.selected;
            console.log(selected);

            patientData=List.getConnectData(patients);
            for (var i = 0; i < selected.length; i++) {
                p=$scope.patientData[selected[i]];
                emailds +=p.resource.name[0].given.join('.') + "." + p.resource.name[0].family.join('.') + "@gmail.com;";
            }

            link=data +emailds +"?subject=" + "Patient Connect - " + $scope.selectedItem.display;
            $scope.link=link;
            window.location.href = link;
        };
        $scope.parJson = function (json) {
            p= JSON.parse(json);
            return p.resource.name[0].given.join('.') + "." + p.resource.name[0].family.join('.') + "@gmail.com;";
        };

    });

    fihrballControllers.controller('aboutController', function($scope) {
        $scope.message = 'About Us';
    });
