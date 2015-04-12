'use strict';

angular.module('myApp.forcedirected', [])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/forcedirected', {
    templateUrl: 'forcedirected/forcedirected.html',
    controller: 'ForcedirectedCtrl'
  });
}])

.directive('goDiagram1', function() {
  return {
    restrict: 'E',
    template: '<div></div>',  // just a simple DIV element
    replace: true,
    scope: { model: '=goModel' },
    link: function(scope, element, attrs) {

  // define a custom ForceDirectedLayout for this sample
  function DemoForceDirectedLayout() {
    go.ForceDirectedLayout.call(this);
  }
  go.Diagram.inherit(DemoForceDirectedLayout, go.ForceDirectedLayout);
  // Override the makeNetwork method to also initialize
  // ForceDirectedVertex.isFixed from the corresponding Node.isSelected.
  DemoForceDirectedLayout.prototype.makeNetwork = function(coll) {
    // call base method for standard behavior
    var net = go.ForceDirectedLayout.prototype.makeNetwork.call(this, coll);
    net.vertexes.each(function(vertex) {
      var node = vertex.node;
      if (node !== null) vertex.isFixed = node.isSelected;
    });
    return net;
  };
  // end DemoForceDirectedLayout class


      var names = {}; // hash to keep track of what names have been used
      var $ = go.GraphObject.make;
      var diagram =  // create a Diagram for the given HTML DIV element
        $(go.Diagram, element[0],
          {
            initialContentAlignment: go.Spot.Center,
            autoScale: go.Diagram.Uniform,  // zoom to make everything fit in the viewport
            layout: new DemoForceDirectedLayout(),
            nodeTemplate: $(go.Node, "Spot",
                            { locationSpot: go.Spot.Center },
                            new go.Binding("text", "text"),  // for sorting
                            $(go.Shape, "Ellipse",
                                { fill: "lightgray",
                                  stroke: "black",
                                  desiredSize: new go.Size(30, 30) },
                                new go.Binding("fill", "fill")),
                            $(go.TextBlock,
                              new go.Binding("text", "text"))
                          ),
            linkTemplate: $(go.Link,
                            { relinkableFrom: true, relinkableTo: true },
                            $(go.Shape),
                            $(go.Shape, { toArrow: "OpenTriangle" })
                          ),
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


  function rebuildGraph() {
    var minNodes = document.getElementById("minNodes").value;
    minNodes = parseInt(minNodes, 10);
    var maxNodes = document.getElementById("maxNodes").value;
    maxNodes = parseInt(maxNodes, 10);
    var minChil = document.getElementById("minChil").value;
    minChil = parseInt(minChil, 10);
    var maxChil = document.getElementById("maxChil").value;
    maxChil = parseInt(maxChil, 10);
    generateTree(minNodes, maxNodes, minChil, maxChil);
  }
  function generateTree(minNodes, maxNodes, minChil, maxChil) {
    diagram.startTransaction("generateTree");
    // replace the diagram's model's nodeDataArray
    generateNodes(minNodes, maxNodes);
    // replace the diagram's model's linkDataArray
    generateLinks(minChil, maxChil);
    // perform a diagram layout with the latest parameters
    layout();
    diagram.commitTransaction("generateTree");
  }
  // Creates a random number of randomly colored nodes.
  function generateNodes(min, max) {
    var nodeArray = [];
    if (isNaN(min) || min < 0) min = 0;
    if (isNaN(max) || max < min) max = min;
    var numNodes = Math.floor(Math.random() * (max - min + 1)) + min;
    for (var i = 0; i < numNodes; i++) {
      nodeArray.push({
        key: i,
        text: i.toString(),
        fill: go.Brush.randomColor()
      });
    }
    // randomize the node data
    for (i = 0; i < nodeArray.length; i++) {
      var swap = Math.floor(Math.random() * nodeArray.length);
      var temp = nodeArray[swap];
      nodeArray[swap] = nodeArray[i];
      nodeArray[i] = temp;
    }
    // set the nodeDataArray to this array of objects
    diagram.model.nodeDataArray = nodeArray;
  }
  // Takes the random collection of nodes and creates a random tree with them.
  // Respects the minimum and maximum number of links from each node.
  // (The minimum can be disregarded if we run out of nodes to link to)
  function generateLinks(min, max) {
    if (diagram.nodes.count < 2) return;
    if (isNaN(min) || min < 1) min = 1;
    if (isNaN(max) || max < min) max = min;
    var linkArray = [];
    // make two Lists of nodes to keep track of where links already exist
    var nit = diagram.nodes;
    var nodes = new go.List(go.Node);
    nodes.addAll(nit);
    var available = new go.List(go.Node);
    available.addAll(nodes);
    for (var i = 0; i < nodes.length; i++) {
      var next = nodes.elt(i);
      available.remove(next)
      var children = Math.floor(Math.random() * (max - min + 1)) + min;
      for (var j = 1; j <= children; j++) {
        if (available.length === 0) break;
        var to = available.elt(0);
        available.remove(to);
        // get keys from the Node.text strings
        var nextKey = parseInt(next.text, 10);
        var toKey = parseInt(to.text, 10);
        linkArray.push({ from: nextKey, to: toKey });
      }
    }
    diagram.model.linkDataArray = linkArray;
  }
  // Update the layout from the controls.
  // Changing the properties will invalidate the layout.
  function layout() {
    diagram.startTransaction("changed Layout");
    var lay = diagram.layout;
    var maxIter = document.getElementById("maxIter").value;
    maxIter = parseInt(maxIter, 10);
    lay.maxIterations = maxIter;
    var epsilon = document.getElementById("epsilon").value;
    epsilon = parseFloat(epsilon, 10);
    lay.epsilon = epsilon;
    var infinity = document.getElementById("infinity").value;
    infinity = parseFloat(infinity, 10);
    lay.infinity = infinity;
    var arrangement = document.getElementById("arrangement").value;
    var arrangementSpacing = new go.Size();
    arrangement = arrangement.split(" ", 2);
    arrangementSpacing.width = parseFloat(arrangement[0], 10);
    arrangementSpacing.height = parseFloat(arrangement[1], 10);
    lay.arrangementSpacing = arrangementSpacing;
    var charge = document.getElementById("charge").value;
    charge = parseFloat(charge, 10);
    lay.defaultElectricalCharge = charge;
    var mass = document.getElementById("mass").value;
    mass = parseFloat(mass, 10);
    lay.defaultGravitationalMass = mass;
    var stiffness = document.getElementById("stiffness").value;
    stiffness = parseFloat(stiffness, 10);
    lay.defaultSpringStiffness = stiffness;
    var length = document.getElementById("length").value;
    length = parseFloat(length, 10);
    lay.defaultSpringLength = length;
    diagram.commitTransaction("changed Layout");
  }

  rebuildGraph();

    }
  };
})

.controller('ForcedirectedCtrl', function($scope) {

});
