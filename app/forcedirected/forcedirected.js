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
.controller('ForcedirectedCtrl', function($scope) {
});
