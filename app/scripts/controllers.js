angular.module('starter.controllers', [])
  .controller('AppCtrl', function($scope, $ionicModal, $timeout) {
    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function() {
        $scope.closeLogin();
      }, 1000);
    };
  })

  .controller('PlaylistsCtrl', function($scope) {
    $scope.playlists = [
      { title: 'Reggae', id: 1 },
      { title: 'Chill', id: 2 },
      { title: 'Dubstep', id: 3 },
      { title: 'Indie', id: 4 },
      { title: 'Rap', id: 5 },
      { title: 'Cowbell', id: 6 }
    ];
  })

  .controller('StopsCtrl', function($scope, $http) {

    $scope.search = function(query){
      $http.get('http://www.cumtd.com/autocomplete/Stops/v1.0/json/search?query=' + query).success(function (data){
        $scope.stops = data;
      });
    };
  })

  //-------------------STOP CONTROLLER BEGIN-----------------------------------------------------------
  .controller('StopCtrl', function($scope, $http, $stateParams, $interval, $ionicModal) {

    $scope.showngroups={};
    $scope.stop_name = $stateParams.stopName;
    /*
     * if given group is the selected group, deselect it
     * else, select the given group
     */
    $scope.toggleGroup = function(group) {
      $scope.showngroups[group] = !$scope.showngroups[group];
      console.log($scope.showngroups);
    };
    $scope.isGroupShown = function(group) {
      return $scope.showngroups[group];
    };


    //load page for modal
    $ionicModal.fromTemplateUrl('templates/stopinfo.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    //opens the modal
    $scope.stopInfo = function() {
      $scope.modal.show();
    };

    //close the modal
    $scope.closeStopInfo = function() {
      $scope.modal.hide();
    };

    $scope.getBusesByRoute = function() {
      $http.get('https://developer.cumtd.com/api/v2.2/json/GetRoutesByStop?key=071ed88917b74528a32f5e635df12f8f&stop_id=' + $stateParams.stopId).success(function(data) {
        angular.forEach(data.routes, function(route){
          route.route_text_color = '#'+route.route_text_color;
          route.route_color = '#'+ route.route_color;
        });
        $scope.buses = data.routes;
      });
    };

    //only gets called once at the start of the page
    $scope.getStopAndDepartures = function() {
      $scope.getStopInfo();
      $scope.updateDepartures();
    };

    $scope.getStopInfo = function() {
      $http.get('https://developer.cumtd.com/api/v2.2/json/GetStop?key=071ed88917b74528a32f5e635df12f8f&stop_id=' + $stateParams.stopId).success(function(data) {
        $scope.stop = data.stops[0];
      });
    };

    $scope.updateDepartures = function() {
      $http.get('https://developer.cumtd.com/api/v2.2/json/GetDeparturesByStop?key=071ed88917b74528a32f5e635df12f8f&stop_id=' + $stateParams.stopId).success(function(data) {
        angular.forEach(data.departures, function(departure) {
          if(departure.expected_mins == 0) departure.expected_mins = 'DUE';
          else departure.expected_mins = departure.expected_mins + ' minutes';
        });
        $scope.departures = data.departures;
        $scope.teams = unique($scope.departures, 'stop_id');
      });
    };

    $scope.getStopName = function(stop_id){
      for(var i=0; i <$scope.stop.stop_points.length; i++){
        if($scope.stop.stop_points[i].stop_id == stop_id){
          return $scope.stop.stop_points[i].stop_name;
        }
      }
    };

    function unique(data, key) {
      var result = [];
      for (var i = 0; i < data.length; i++) {
        var value = data[i][key];
        if (result.indexOf(value) == -1) {
          result.push(value);
        }
      }
      return result;
    }

    $scope.doRefresh = function(){
      $scope.updateDepartures();
      $scope.$broadcast('scroll.refreshComplete');
    };

    //refresh departure list every 60 seconds
    var intervalPromise = $interval(function() {
      $scope.updateDepartures();
    }, 60000)

    $scope.stopUpdate = function() {
        $interval.cancel(intervalPromise);
    };

    //destroy interval on close
    $scope.$on('$destroy', function() {
      // Make sure that the interval is destroyed too
      $scope.stopUpdate();
    });
  })
//-------------------STOP CONTROLLER END---------------------------------------------------------------

  .controller('PlaylistCtrl', function($scope, $stateParams) {
  });
