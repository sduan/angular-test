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
      var names = {}; // hash to keep track of what names have been used
      var $ = go.GraphObject.make;
      var diagram =  // create a Diagram for the given HTML DIV element
        $(go.Diagram, element[0],
          {
            initialAutoScale: go.Diagram.UniformToFill,
            layout: $(go.TreeLayout, { nodeSpacing: 5, layerSpacing: 30 }),
            nodeTemplate: $(go.Node, "Horizontal",
                            { selectionChanged: nodeSelectionChanged },
                            $(go.Panel, "Auto",
                            $(go.Shape, { fill: "darkslategray", stroke: null }),
                            $(go.TextBlock, { font: "bold 13px Helvetica, bold Arial, sans-serif", stroke: "white", margin: 3 }, new go.Binding("text", "key"))
                            ),
                            $("TreeExpanderButton")
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
        // var oldmodel = diagram.model;
        // if (oldmodel !== newmodel) {
        //   if (oldmodel) oldmodel.removeChangedListener(updateAngular);
        //   newmodel.addChangedListener(updateAngular);
        //   diagram.model = newmodel;
        // }
      });
      // update the model when the selection changes
      diagram.addDiagramListener("ChangedSelection", function(e) {
        var selnode = diagram.selection.first();
        diagram.model.selectedNodeData = (selnode instanceof go.Node ? selnode.data : null);
        scope.$apply();
      });


    var nodeDataArray = [];

    // Walk the DOM, starting at document
    function traverseDom(node, parentName) {
      // skip everything but HTML Elements
      if (!(node instanceof Element)) return;
      // Ignore the menu on the left of the page
      if (node.id === "menu") return;
      // add this node to the nodeDataArray
      var name = getName(node);
      var data = { key: name, name: name };
      nodeDataArray.push(data);
      // add a link to its parent
      if (parentName !== null) {
        data.parent = parentName;
      }
      // find all children
      var l = node.childNodes.length;
      for (var i = 0; i < l; i++) {
        traverseDom(node.childNodes[i], name);
      }
    }

    // Give every node a unique name
    function getName(node) {
      var n = node.nodeName;
      if (node.id) n = n + " (" + node.id + ")";
      var namenum = n;
      var i = 1;
      while (names[namenum] !== undefined) {
        namenum = n + i;
        i++;
      }
      names[namenum] = node;
      return namenum;
    }

    // build up the tree
    traverseDom(document.activeElement, null);

    // create the model for the DOM tree
    diagram.model = new go.TreeModel(nodeDataArray);

      // When a Node is selected, highlight the corresponding HTML element.
      function nodeSelectionChanged(node) {
        if (node.isSelected) {
          names[node.data.name].style.backgroundColor = "lightblue";
        } else {
          names[node.data.name].style.backgroundColor = "";
        }
      }
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
