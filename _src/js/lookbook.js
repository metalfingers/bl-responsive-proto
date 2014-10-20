"use strict";

var BloomiesLookbook = function($lookbook, options) {

  var _slideDimensions = function(){
        var tallest = 0,
            widest = 0;

        $lookbook.find('.lookbook-page').each(function(index, el) {
          $(el).height() > tallest ? tallest = $(el).height() : tallest = tallest;
          $(el).width() > widest ? widest = $(el).height() : widest = widest;
        });

        return {
          height: tallest,
          width: widest
        }
      };


  return {
    state: {
      isActive: false,
      optionsSet: false
    },

    activate: function(){
      var _this = this;

      if (!_this.state.optionsSet) {
        // loop through all options and run them...may be a better idea to 
        // match option names and setOption methods and just run the ones that
        // exist in the options object.
        for (opt in _this.setOptions) {
          _this.setOptions[opt].apply(_this);
        }
      }

      $lookbook
        .addClass('is-active')
        .css('height', _slideDimensions().height );
      
      _this.state.isActive = true;
    },

    kill: function(){
      var _this = this;

      $lookbook
        .removeClass('is-active')
        .css('height', '');

      _this.state.isActive = false;
    },

    setOptions: {
      
      breakPoint: function(){
        var _this = this,
            resizeStart = new Date(0),
            timeout = false,
            msToWait = 100,
            resizeEnded = function(){
              if (new Date() - resizeStart < msToWait) {
                window.setTimeout(resizeEnded, msToWait);
              } else {
                timeout = false;
                if ($(window).width() < options.breakPoint && _this.state.isActive) {
                  _this.kill();
                } else if ($(window).width() > options.breakPoint) {
                  _this.activate();
                }                
              }
            };


        if (typeof options.breakPoint === 'number') {
          $(window).resize(function(event) {
            resizeStart = new Date();
            if (timeout === false) {
              timeout = true;
              window.setTimeout(resizeEnded, msToWait);
            }
          });
        }
      } // end setOptions.breakPoint

    }
  } 
};