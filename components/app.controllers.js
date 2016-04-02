// app.controllers.js
/* Controllers */

    // create the module and name it fihrballControllers
    var fihrballControllers = angular.module('fihrballControllers', []);

    // create the controller and inject Angular's $scope
    fihrballControllers.controller('mainController', function($scope) {
        $scope.message = 'Everyone come and see how good I look!';
    });

    fihrballControllers.controller('listController', function($scope, $http, List) {

        $scope.message = 'This page shows the conditions available.';

        $scope.list = List.getList();
    });

    fihrballControllers.controller('searchController', function($scope, $http, $log, List) {
        $scope.message = 'This is the search page.';

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
                        });
                }

            });
        };

    });

    fihrballControllers.controller('reportsController', function($scope, $http, $q, $timeout, List) {
        $scope.message = 'This is the reports page.';

        $scope.list = List.getList();

        var text;

        $scope.changedValue = function(input){
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
                    $scope.patientData = List.getData(patients);
                });
        };

        var patients = [];

    });

    fihrballControllers.controller('aboutController', function($scope) {
        $scope.message = 'About Us';
    });
