angular.module('starter.controllers', ['ngCordova'])

  .controller('StopsCtrl', function($scope, $http, $cordovaFile) {
    $scope.search = function(query){
      $http.get('http://www.cumtd.com/autocomplete/Stops/v1.0/json/search?query=' + query).success(function (data){
        $scope.stops = data;
      })
    };

    $scope.favorite = function(item){
      $scope.favorites.push(
        {'c': item.c,
        'i': item.i,
        'n': item.n}
      );
      $scope.test=JSON.stringify($scope.favorites);
      writeToDisk();
    };
    $scope.unfavorite = function(item){
      $scope.favorites.splice($scope.functiontofindIndexByKeyValue($scope.favorites,'i', item.i),1);
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
      $cordovaFile.writeFile('favorites.txt', JSON.stringify($scope.favorites), true).then(function(result) {
        //success
      }, function(err) {
        $scope.test = 'notworked1 ' + JSON.stringify(err);
        // An error occurred. Show a message to the user
      });
    }

    $scope.getFavorites = function(){
      if($scope.favorites){
        return;
      }
      $cordovaFile.checkFile('favorites.txt')
        .then(function (success) {
          $cordovaFile.readAsText('favorites.txt').then(function(result) {
            $scope.test= result;
            $scope.favorites = JSON.parse(result);
          }, function(err) {
            $scope.test = 'notworked1 ' + JSON.stringify(err);
            $scope.favorites = [];
          });
        }, function (error) {
          $scope.test = 'notworked001 ' + JSON.stringify(error);
          $scope.favorites=[];
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
      $http.get('https://developer.cumtd.com/api/v2.2/json/GetStop?key=071ed88917b74528a32f5e635df12f8f&stop_id=' + $stateParams.stopId).success(function(data) {
        console.log('GetStop');
        $scope.stop = data.stops[0];
      });
    };

    $scope.updateDepartures = function() {
      $http.get('https://developer.cumtd.com/api/v2.2/json/GetDeparturesByStop?key=071ed88917b74528a32f5e635df12f8f&stop_id=' + $stateParams.stopId).success(function(data) {
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
