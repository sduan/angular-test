'use strict';

angular.module('myApp.view2', [])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.directive('goDiagram', function() {
  return {
    restrict: 'E',
    template: '<div></div>',  // just a simple DIV element
    replace: true,
    scope: { model: '=goModel' },
    link: function(scope, element, attrs) {
      var $ = go.GraphObject.make;
      var diagram =  // create a Diagram for the given HTML DIV element
        $(go.Diagram, element[0],
          {
            nodeTemplate: $(go.Node, "Auto",
                            { locationSpot: go.Spot.Center },
                            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                            $(go.Shape, "RoundedRectangle", new go.Binding("fill", "color"),
                              {
                                portId: "", cursor: "pointer",
                                fromLinkable: true, toLinkable: true,
                                fromLinkableSelfNode: true, toLinkableSelfNode: true,
                                fromLinkableDuplicates: true, toLinkableDuplicates: true
                              }),
                            $(go.TextBlock, { margin: 3 }, new go.Binding("text", "key"))
                          ),
            linkTemplate: $(go.Link,
                            { relinkableFrom: true, relinkableTo: true },
                            $(go.Shape),
                            $(go.Shape, { toArrow: "OpenTriangle" })
                          ),
            initialContentAlignment: go.Spot.Center,
            "undoManager.isEnabled": true
          });
      // whenever a GoJS transaction has finished modifying the model, update all Angular bindings
      function updateAngular(e) {
        if (e.isTransactionFinished) scope.$apply();
      }
      // notice when the value of "model" changes: update the Diagram.model
      scope.$watch("model", function(newmodel) {
        var oldmodel = diagram.model;
        if (oldmodel !== newmodel) {
          if (oldmodel) oldmodel.removeChangedListener(updateAngular);
          newmodel.addChangedListener(updateAngular);
          diagram.model = newmodel;
        }
      });
      // update the model when the selection changes
      diagram.addDiagramListener("ChangedSelection", function(e) {
        var selnode = diagram.selection.first();
        diagram.model.selectedNodeData = (selnode instanceof go.Node ? selnode.data : null);
        scope.$apply();
      });
    }
  };
})
.controller('View2Ctrl', function($scope) {
  $scope.model = new go.GraphLinksModel(
    [
      { key: "Alpha", color: "lightblue" },
      { key: "Beta", color: "orange" },
      { key: "Gamma", color: "lightgreen" },
      { key: "Delta", color: "pink" },
      { key: "aaa", color: "black" }
    ],
    [
      { from: "Alpha", to: "Beta" },
      { from: "Alpha", to: "Gamma" },
      { from: "Beta", to: "Beta" },
      { from: "Gamma", to: "Delta" },
      { from: "Delta", to: "Alpha" }
    ]);
  $scope.model.selectedNodeData = null;
  $scope.replaceModel = function() {
    $scope.model = new go.GraphLinksModel(
        [
          { key: "zeta", color: "red" },
          { key: "eta", color: "green" }
        ],
        [
          { from: "zeta", to: "eta" }
        ]
      );
  }
});
