'use strict';

describe('myApp.mandelbrot module', function() {

  beforeEach(module('myApp.mandelbrot'));

  describe('mandelbrot controller', function(){

    it('should ....', inject(function($controller) {
      //spec body
      var mandelbrotCtrl = $controller('MandelbrotCtrl');
      expect(MandelbrotCtrl).toBeDefined();
    }));

  });
});