// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: 'AppCtrl'
      })

      .state('app.stops', {
        url: "/stops",
        views: {
          'menuContent': {
            templateUrl: "templates/stops.html",
            controller: 'StopsCtrl'
          }
        }
      })

      .state('app.stop', {
        url: "/stops/:stopId?stopName",
        views: {
          'menuContent': {
            templateUrl: "templates/stop.html",
            controller: 'StopCtrl'
          }
        }
      })

      .state('app.stopinfo', {
        url: "/stopinfo/:stopId",
        views: {
          'menuContent': {
            templateUrl: "templates/stopinfo.html",
            controller: 'StopCtrl'
          }
        }
      })

      .state('app.gps', {
        url: "/gps",
        views: {
          'menuContent': {
            templateUrl: "templates/gps.html",
            controller: 'GPSCtrl'
          }
        }
      })

      .state('app.walk', {
        url: "/walk",
        views: {
          'menuContent': {
            templateUrl: "templates/walk.html",
            controller: 'WalkCtrl'
          }
        }
      })

      .state('app.buses', {
        url: "/buses",
        views: {
          'menuContent': {
            templateUrl: "templates/buses.html",
            controller: 'BusesCtrl'
          }
        }
      })

      .state('app.bus', {
        url: "/buses/:busId?busName",
        views: {
          'menuContent': {
            templateUrl: "templates/bus.html",
            controller: 'BusCtrl'
          }
        }
      })

      .state('app.favorites', {
        url: "/favorites",
        views: {
          'menuContent': {
            templateUrl: "templates/favorites.html",
            controller: 'StopsCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/stops');
  });
