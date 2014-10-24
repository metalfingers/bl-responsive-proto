"use strict";

var BloomiesLookbook = function($lookbook, options) {

  var $cache = {},

      _cacheLookBook = function(){
        $cache = {}; // empty the cache
        $cache.lookbook = $lookbook;
        $cache.pages = [];
        $cache.lookbook
          .children('.lookbook-page-wrapper')
          .children('.lookbook-page')
          .each(function(index, el) {
            $cache.pages[index] = $(el); // add lookbook page to pages array
          });
        $cache.pagination = [];
        $cache.lookbook
          .children('.lookbook-pagination')
          .find('li')
          .each(function(index, el) {
            $cache.pagination[index] = $(el); // add pagination items to pagination array
          });
        $cache.nav = {
          nextBtn: $cache.lookbook.children('.lookbook-nav-arrow.go-to-next'),
          prevBtn: $cache.lookbook.children('.lookbook-nav-arrow.go-to-prev')
        };
      },

      _slideDimensions = function(){
        var tallest = 0,
            widest = 0;

        $.each($cache.pages, function(index, el) {
          el.height() > tallest ? tallest = el.height() : tallest = tallest;
          el.width() > widest ? widest = el.height() : widest = widest;
        });

        return {
          height: tallest,
          width: widest
        }
      },

      _setCurrentPage = function(pageNum){

        pageNum === undefined || -1 ? 1 : pageNum; // set 1 as the default

        $.each($cache.pages, function(index, el) {
          el.removeClass('current-page');
        });

        $cache.pages
          .filter(function(el, index) {
            return $(el).data('page-number') === pageNum;
          })[0]
          .addClass('current-page');

        return _getCurrentPage();
      },

      _getCurrentPage = function(){
        return $cache.pages
          .filter(function(el, index){
            return $(el).hasClass('current-page');
          })[0];
      },

      _keepInBounds = function(direction, transitionFunction, slideNumber) {

        transitionFunction(slideNumber);
      },

      // toPage is an int
      _transitionFade = function(toPage){
        _getCurrentPage()
          .animate({opacity: 0}, 500, function(){
            _setCurrentPage(toPage)
              .animate({opacity: 1}, 500);            
          });
      },

      _transitionSkip = function(){

      },

      _transitionSlide = function(){
        
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

      // cache the lookbook pieces first!
      _cacheLookBook();

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

      // add .is-active to the lookbook wrapper, set height
      $cache.lookbook
        .addClass('is-active')
        .css('height', _slideDimensions().height );

      $.each($cache.pages, function(index, el) {
        el.css('width', $cache.lookbook.width() );
        el.css('position', 'absolute');
      });
   
      _setCurrentPage(1);
      _this.state.transition( 'forward', 1);
      _this.state.isActive = true;




$cache.nav.nextBtn.click(function(event) {
  _this.state.transition( 'forward', _getCurrentPage().data('page-number') + 1);
});

$cache.nav.prevBtn.click(function(event) {
  _this.state.transition( 'backward', _getCurrentPage().data('page-number') - 1);
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