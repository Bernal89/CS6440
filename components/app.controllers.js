// app.controllers.js
/* Controllers */

//Data
var cities = [
    {
        city : 'Toronto',
        desc : 'This is the best city in the world!',
        lat : 43.7000,
        long : -79.4000
    },
    {
        city : 'New York',
        desc : 'This city is aiiiiite!',
        lat : 40.6700,
        long : -73.9400
    },
    {
        city : 'Chicago',
        desc : 'This is the second best city in the world!',
        lat : 41.8819,
        long : -87.6278
    },
    {
        city : 'Los Angeles',
        desc : 'This city is live!',
        lat : 34.0500,
        long : -118.2500
    },
    {
        city : 'Las Vegas',
        desc : 'Sin City...\'nuff said!',
        lat : 36.0800,
        long : -115.1522
    }
];

    // create the module and name it fihrballControllers
    var fihrballControllers = angular.module('fihrballControllers', []);

    // create the controller and inject Angular's $scope
    fihrballControllers.controller('mainController', function($scope) {
        $scope.message = 'Everyone come and see how good I look!';
    });

    fihrballControllers.controller('listController', function($scope, $http) {

        $scope.message = 'This page shows the conditions available.';

        $http.get('http://polaris.i3l.gatech.edu:8080/gt-fhir-webapp/base/Condition').success(function(data) {

            $scope.list = [];

            // Grab each condition and add it to the array, no duplicates
            angular.forEach(data.entry, function(entry, index) {
                if ($scope.list.indexOf(entry.resource.notes) == -1) {
                    $scope.list.push(entry.resource.notes);
                }
            });
        });
    });

    fihrballControllers.controller('searchController', function($scope) {
        $scope.message = 'This is the search page.';

        var mapOptions = {
            zoom: 4,
            center: new google.maps.LatLng(40.0000, -98.0000),
            mapTypeId: google.maps.MapTypeId.TERRAIN
        }

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

        }

        for (i = 0; i < cities.length; i++){
            createMarker(cities[i]);
        }

        $scope.openInfoWindow = function(e, selectedMarker){
            e.preventDefault();
            google.maps.event.trigger(selectedMarker, 'click');
        }
    });

    fihrballControllers.controller('reportsController', function($scope) {
        $scope.message = 'This is the reports page.';
    });

    fihrballControllers.controller('aboutController', function($scope) {
        $scope.message = 'About Us';
    });
