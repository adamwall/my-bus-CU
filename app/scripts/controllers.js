angular.module('starter.controllers', ['ngCordova'])

  .controller('AppCtrl', function() {

  })

  .controller('StopsCtrl', function($scope, $http, $cordovaFile, $rootScope) {
    $scope.search = function(query){
      $http.get('http://www.cumtd.com/autocomplete/Stops/v1.0/json/search?query=' + query).success(function (data){
        $scope.stops = data;
      })
    };

    $scope.favorite = function(item){
      $rootScope.favorites.push(
        {'c': item.c,
        'i': item.i,
        'n': item.n}
      );
      writeToDisk();
    };
    $scope.unfavorite = function(item){
      $rootScope.favorites.splice($scope.functiontofindIndexByKeyValue($rootScope.favorites,'i', item.i),1);
      writeToDisk();
    };

    $scope.functiontofindIndexByKeyValue = function(arraytosearch, key, valuetosearch) {
      for (var i = 0; i < arraytosearch.length; i++) {

        if (arraytosearch[i][key] == valuetosearch) {
          return i;
        }
      }
      return -1;
    };

    function writeToDisk(){
      $cordovaFile.writeFile('favorites.txt', JSON.stringify($rootScope.favorites), true).then(function(result) {
        //success
      }, function(err) {
        // An error occurred. Show a message to the user
      });
    }

    $rootScope.getFavorites = function(){
      if($rootScope.favorites && $rootScope.favorites.length>0){
        return;
      }
      else {
        $cordovaFile.checkFile('favorites.txt')
          .then(function (success) {
            $cordovaFile.readAsText('favorites.txt').then(function (result) {
              $rootScope.favorites = JSON.parse(result);
            }, function (err) {
              $rootScope.favorites = [];
            });
          }, function (error) {
            $rootScope.favorites = [];
          });
      }
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
      $http.get('http://busserve-45451.onmodulus.net/routes/' + $stateParams.stopId).success(function(data) {
        console.log('GetRoutesByStop');
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
      $http.get('http://busserve-45451.onmodulus.net/stop/' + $stateParams.stopId).success(function(data) {
        console.log('GetStop');
        $scope.stop = data.stops[0];
      });
    };

    $scope.updateDepartures = function() {
      $http.get('http://busserve-45451.onmodulus.net/departures/' + $stateParams.stopId).success(function(data) {
        console.log('GetDeparturesByStop');
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
    }, 60000);

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

  .controller('GPSCtrl', function($scope, $cordovaGeolocation, $cordovaFile, $http, $rootScope) {

    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        $http.get('https://developer.cumtd.com/api/v2.2/json/GetStopsByLatLon?key=071ed88917b74528a32f5e635df12f8f&lat='+position.coords.latitude+'&lon='+position.coords.longitude)
          .success(function(data){
            $scope.stops = data.stops;
            $scope.message=null;
          });
      }, function(err) {
        // error
        $scope.message = 'Error getting coords';
        console.log(err);
      });

    $scope.favorite = function(item){
      $rootScope.favorites.push(
        {'c': item.code,
          'i': item.stop_id,
          'n': item.stop_name}
      );
      writeToDisk();
    };
    $scope.unfavorite = function(item){
      $rootScope.favorites.splice($scope.functiontofindIndexByKeyValue($rootScope.favorites,'i', item.i),1);
      writeToDisk();
    };

    $scope.functiontofindIndexByKeyValue = function(arraytosearch, key, valuetosearch) {
      for (var i = 0; i < arraytosearch.length; i++) {

        if (arraytosearch[i][key] == valuetosearch) {
          return i;
        }
      }
      return -1;
    };

    function writeToDisk(){
      $cordovaFile.writeFile('favorites.txt', JSON.stringify($rootScope.favorites), true).then(function(result) {
        //success
      }, function(err) {
        // An error occurred. Show a message to the user
      });
    }

    $rootScope.getFavorites = function(){
      if($rootScope.favorites && $rootScope.favorites.length > 0){
        return;
      }
      $cordovaFile.checkFile('favorites.txt')
        .then(function (success) {
          $cordovaFile.readAsText('favorites.txt').then(function(result) {
            $rootScope.favorites = JSON.parse(result);
          }, function(err) {
            $rootScope.favorites = [];
          });
        }, function (error) {
          $rootScope.favorites=[];
        });

    };
  })

  .controller('WalkCtrl', function($scope, $cordovaGeolocation, $http) {
    $scope.place = {};
    var autoComplete = new google.maps.places.Autocomplete(
      /** @type {HTMLInputElement} */(document.getElementById('autocomplete')),
      {componentRestrictions: {country: 'us'} });

    var autoComplet2 = new google.maps.places.Autocomplete(
      /** @type {HTMLInputElement} */(document.getElementById('autocomplete2')),
      {componentRestrictions: {country: 'us'} });

    google.maps.event.addListener(autoComplete, 'place_changed', function() {
      var place = autoComplete.getPlace();
      $scope.place.origin = place.geometry.location.k + ', ' + place.geometry.location.D;
      $scope.$apply();
    });
    google.maps.event.addListener(autoComplet2, 'place_changed', function() {
      var place = autoComplet2.getPlace();
      $scope.place.dest = place.geometry.location.k + ', ' + place.geometry.location.D;
      $scope.$apply();
    });

    var circle = new google.maps.Circle({
      center: new google.maps.LatLng(40.1105, -88.2284), //UIUC lat long
      radius: 5
    });
    autoComplete.setBounds(circle.getBounds());
    autoComplet2.setBounds(circle.getBounds());

    $scope.geolocate = function(){
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
          $scope.place.origin = position.coords.latitude + ', ' + position.coords.longitude;
          //position.coords.latitude;
        }, function(err) {
          // error
          $scope.message = 'Error getting coords';
          console.log(err);
        });
    };

    $scope.getWalk = function(origin, dest){
      console.log(autoComplete.getPlace());
      var from = document.getElementById('autocomplete').value;
      var to = document.getElementById('autocomplete2').value;
      $http.get('https://maps.googleapis.com/maps/api/directions/json?mode=transit&transit_mode=bus&key=AIzaSyCiHDJiqaixmuXT6LpSJeIoF3gLN7VLgJM&origin='+from+'&destination='+to)
        .success(function(data_transit){
          console.log(data_transit);
            $scope.transit_duration = data_transit.routes[0].legs[0].duration.value;
          $http.get('https://maps.googleapis.com/maps/api/directions/json?mode=walking&origin='+from+'&destination='+to)
            .success(function(data_walk){
                $scope.walking_duration = data_walk.routes[0].legs[0].duration.value;
              console.log(data_walk);
            });
        });

    }


  });
