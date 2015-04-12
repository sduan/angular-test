'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.mandelbrot',
  'myApp.view1',
  'myApp.view2',
  'myApp.forcedirected',
  'myApp.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/mandelbrot'});
}]);
