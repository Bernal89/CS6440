// app.routes.js

    // create the module and name it fihrballApp
    var fihrballApp = angular.module('fihrballApp', [
      'ngRoute',
      'fihrballControllers'
    ]);

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
