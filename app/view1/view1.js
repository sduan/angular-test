'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', function ($scope) {
    $scope.myData = [10,20,30,40,60];
})

.directive('barsChart', function ($parse) {
  return {
      restrict: 'E',
      //we don't want to overwrite our directive declaration
      //in the HTML mark-up
      replace: false,
      //scope: {data: '=chartData'},
      link: function (scope, element, attrs) {
        var data = attrs.chartData.split(',');
        var chart = d3.select(element[0]);
         chart.append("div").attr("class", "chart")
          .selectAll('div')
          .data(data).enter().append("div")
          .transition().ease("elastic")
          .style("width", function(d) { return d + "%"; })
          .text(function(d) { return d + "%"; });
      } 
   };
});
