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
      },

      _setCurrentPage = function(pageNum){

        pageNum === undefined || -1 ? pageNum = 0 : pageNum = pageNum; // set 0 as the default

        $( $lookbook.find('.lookbook-page')[ pageNum ] )
          .addClass('current-page');

        if (options.transitionStyle === 'fade') {
          $lookbook.find('.current-page').css('opacity', 1);
        };

      },

      _keepInBounds = function(direction, transitionFunction, slideNumber) {

        transitionFunction(slideNumber);
      },

      // toPage is an int
      _transitionFade = function(toPage){
        $lookbook.find('.lookbook-page.current-page')
          .animate({opacity: 0}, 500)
          .removeClass('current-page');
        $( $lookbook.find('.lookbook-page:not(.lookbook-page .lookbook-page)')[ toPage ] )
          .animate({opacity: 1}, 500)
          .addClass('current-page');
      },

      _transitionSkip = function(){

      },

      _transitionSlide = function(){
        $lookbook.find('.lookbook-page')
      };


  return {
    state: {
      isActive: false,
      optionsSet: false,
      transition: function(arg){ 
        _transitionSlide(arg); 
      }
    },

    activate: function(){
      var _this = this;

      // run through the options at least once
      if (!_this.state.optionsSet) {
        // loop through all options and run them...may be a better idea to 
        // match option names and setOption methods and just run the ones that
        // exist in the options object.
        for (opt in _this.setOptions) {
          _this.setOptions[opt].apply(_this);
        }

        _this.state.optionsSet = true;
      }

      // we always need to run through the options but we don't always need to
      // activate the lookbook. If we're past the breakpoint, return
      if ($(window).width() < options.breakPoint) {
        return;
      }

      $lookbook
        .addClass('is-active')
        .css('height', _slideDimensions().height );


      $lookbook.find('.lookbook-page')
        .each(function(index, el) {
          $(el).css('width', $lookbook.find('.lookbook-page-wrapper').width() );
          // $(el).css('left', $lookbook.find('.lookbook-page-wrapper').width() );
          $(el).css('position', 'absolute');
        });
   
      _setCurrentPage(0);

      _this.state.isActive = true;




$lookbook.find('.go-to-next:not(.go-to-next .go-to-next)').click(function(event) {
  _this.state.transition( 'forward', $lookbook.find('.lookbook-page').index( $lookbook.find('.current-page') ) + 1 );
});

$lookbook.find('.go-to-prev:not(.go-to-prev .go-to-prev)').click(function(event) {
  _this.state.transition( 'backward', $lookbook.find('.lookbook-page').index( $lookbook.find('.current-page') ) - 1 );
});
    },

    kill: function(){
      var _this = this;

      $lookbook
        .removeClass('is-active')
        .css('height', '');

      $lookbook.find('.lookbook-page')
        .css({
          width: '',
          left: '',
          opacity: '',
          position: ''
        });

      _this.state.isActive = false;
    },

    setOptions: {
      
      // breakPoint: defines the browser width where the lookbook switches from desktop to mobile layout
      // type: int
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
      }, // end setOptions.breakPoint

      // transitionStyle: defines the transition between slides
      // input: string
      // options: "slide" [default], "fade", "skip"
      transitionStyle: function(){
        var _this = this;

        switch (options.transitionStyle) {
          case "fade":
            // stuff
            $lookbook.find('.lookbook-page:not(.lookbook-page .lookbook-page)').css('opacity', 0);
            _this.state.transition = function(direction, destination) { _keepInBounds(direction, _transitionFade, destination); }
            break;
          case "skip":
            // stuff
            _transitionSkip();
          default:
            // slide is the default
            _transitionSlide();
        }
      }

    }
  } 
};