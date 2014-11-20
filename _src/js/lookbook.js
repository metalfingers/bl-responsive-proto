var cl = function(arg){
  console.log(arg);
};



var BloomiesLookbook = function($lookbook, options) {
  "use strict";

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
        $cache.pagination = []; // this is a collection of "go-to-page" links all over the place
        $cache.lookbook
          .find('*[data-for-page-number]')
          .each(function(index, el) {
            // add pagination items to pagination array
            $cache.pagination[index] = $(el); 
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
          tallest = el.height() > tallest ? el.height() : tallest;
          widest = el.width() > widest ? el.width() : widest;
        });

        return {
          height: tallest,
          width: widest
        };
      },

      _setCurrentPage = function(pageNum){

        // set 1 as the default
        pageNum = pageNum === (undefined || -1) ?  1 : pageNum; 

        // set current-page class on lookbook pages
        $.each($cache.pages, function(index, el) {
          el.removeClass('current-page');
        });

        // use jQuery's .filter method because IE8 Arrays 
        // don't have filter built in
        $($cache.pages) 
          .filter(function(index) {
            return $(this).data('page-number') === pageNum;
          })[0]
          .addClass('current-page');

        // set current-page class on pagination items (wherever they are)
        if ($cache.pagination.length > 0) {
          $.each($cache.pagination, function(index, val) {
            val.removeClass('current-page');
          });

          $($cache.pagination)
            .filter(function(index) {
              return $(this).data('for-page-number') === pageNum;
            })[0]
            .addClass('current-page');
        }

        return _getCurrentPage();
      },

      _getCurrentPage = function(){
        return $($cache.pages)
          .filter(function(index){
            return $(this).hasClass('current-page');
          })[0];
      },

      // _keepInBounds: ensures that we don't navigate to a slide that's not in
      //                the realm of possibilty (a number less than 0 or greater
      //                than the length of the lookbook)
      // args:          direction (int) ['forward', 'backward', 'introPage']
      _keepInBounds = function(direction, transitionFunction, slideNumber) {
        // check to see if slideNumber is greater than the length of the 
        // lookbook or less than the first page in the lookbook
        if (slideNumber > $cache.pages.length ||
              slideNumber < options.startPage) { 
        
          // if direction is "introPage" go there and return
          if (direction === 'introPage') {
            slideNumber = options.introPage;
          } else if (direction === 'backward') {
            slideNumber = options.startPage;
          } else {
            slideNumber = $cache.pages.length;
          } 

        } 

        // if slideNumber is out of bounds, go to the redefined slideNumber,
        // else just go to wherever was sent in
        transitionFunction(direction, slideNumber);
      },

      // toPage is an int
      _transitionFade = function(direction, toPage){
        _getCurrentPage().removeClass('transition-fade-in');
        _setCurrentPage(toPage).addClass('transition-fade-in');
      },

      _transitionSkip = function(direction, toPage){

      },

      _transitionSlide = function(direction, toPage){
        
      },

      _transitionCards = function(direction, toPage){
        
        switch (direction) {
          case "forward":
            $cache.pagination[toPage].css('left', function(){
              $(this).width();
            })
            .addClass('is-sliding')
            .animate({'left': 0}, 500);
        }
      };


  return {
    state: {
      isActive: false,
      optionsSet: false,
      introPageDisplayed: false,
      nameSpace: null,
      transition: function(arg){ 
        _transitionSlide(arg); 
      }
    },

    activate: function(){
      var _this = this;

      // first things first. if we're in IE8, just quit!
      if ($('html.lt-ie9').length > 0) {
        return;
      }

      // second thing second. namespace the thing!
      _this.state.nameSpace = 'lookBook' + Date.now();

      // cache the lookbook pieces first!
      _cacheLookBook();

      // run through the options at least once
      if (!_this.state.optionsSet) {
        // loop through all options and run them...may be a better idea to 
        // match option names and setOption methods and just run the ones that
        // exist in the options object.
        for (var opt in _this.setOptions) {
          _this.setOptions[opt].apply(_this);
        }

        _this.state.optionsSet = true;
      }

      // we always need to run through the options but we don't always need to
      // activate the lookbook. If we're past the breakpoint, kill it so that
      // we can add the correct utility classes and state values
      if ($(window).width() < options.breakPoint) {
        _this.kill();
        return;
      }

      // add .is-active to the lookbook wrapper
      $cache.lookbook
        .addClass('is-active');

      // set heightof lookbook page wrapper
      $cache.lookbook
        .children('.lookbook-page-wrapper')
        .css('height', _slideDimensions().height );

      $.each($cache.pages, function(index, el) {
        el.css('width', $cache.lookbook.width() );
        el.css('position', 'absolute');
      });
   
      _this.setEventHandlers();

      _setCurrentPage(1);

      // If there's a introPage, go to it. Otherwise go to pg 1
      if (options.introPage) {
        _this.state.transition( 'forward', options.introPage);
      } else {
        _this.state.transition( 'forward', 1);  
      }

      _this.state.isActive = true;

    },

    kill: function(){
      var _this = this;

      $lookbook
        .removeClass('is-active')
        .addClass('is-deactivated')
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
      
      // arrowPosition: sets the position of the arrows
      // type: string
      // opts: 'horizontal' [default], 'vertical'
      arrowPosition: function(){
        var _this = this;
        if (options.arrowPosition === 'vertical') {
          $cache.lookbook
            .find('.lookbook-nav-arrow')
            .removeClass('layout-horizontal')
            .addClass('layout-vertical');
        } else if (options.arrowPosition === 'horizontal') {
          $cache.lookbook
            .find('.lookbook-nav-arrow')
            .removeClass('layout-vertical')
            .addClass('layout-horizontal');
        }

      },

      // breakPoint: defines the browser width where the lookbook switches 
      //              from desktop to mobile layout
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
                if ($(window).width() < options.breakPoint && 
                    _this.state.isActive) {
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

      // startPage: defines the first slide in the lookbook
      // input: int
      // options: 1[default]...whatever 
      startPage: function(){
        options.startPage = options.startPage ? options.startPage : 1;
      },

      // introPage: defines the lookbook's intro page. 
      //            This will only be shown once, so make it count!
      // input: int
      // options: 1...whatever (no default)
      introPage: function(){
        // placeholder...
      },

      // transitionDirection: define the direction of the page transition
      // input: string
      // options: 'horizontal' [default], 'vertical'
      transitionDirection: function(){
        if (options.transitionDirection !== undefined) {
          $cache.lookbook
            .addClass('transition-direction-' + options.transitionDirection);
        } else {
           $cache.lookbook
            .addClass('transition-direction-horizontal');
        }
      },

      // transitionStyle: defines the transition between slides
      // input: string
      // options: "slide" [default], "fade", "skip", "cards"
      transitionStyle: function(){
        var _this = this;

        switch (options.transitionStyle) {
          case "fade":
            // stuff
            $.each($cache.pages, function(index, val) {
               $(val).addClass('transition-fade');
            });
            _this.state.transition = function(direction, destination) { 
              $(window).trigger('pageChangeStart.' + _this.state.nameSpace);
              _keepInBounds(direction, _transitionFade, destination); 
              $(window).trigger('pageChangeEnd.' + _this.state.nameSpace); 
            };
            break;
          case "skip":
            // stuff
            _transitionSkip();
            break;
          case "cards":
            // stuff
            _this.state.transition = function(direction, destination) { 
              $(window).trigger('pageChangeStart.' + _this.state.nameSpace);
              _keepInBounds(direction, _transitionCards, destination); 
              $(window).trigger('pageChangeEnd.' + _this.state.nameSpace); 
            };
            break;
          default:
            // slide is the default
            _transitionSlide();
        }
      }

    },

    setEventHandlers: function(){
      var _this = this;

      $cache.nav.nextBtn.click(function(event) {
        _this.goToNext();
      });

      $cache.nav.prevBtn.click(function(event) {
        _this.goToPrev();
      });

      $.each($cache.pagination, function(index, val) {
          $(val).click(function(event) {
            _this.goToPage($(this).data('for-page-number'));
          });
       }); 
    },

    goToNext: function(){
      var _this = this;
      _this.state.transition( 'forward', _getCurrentPage().data('page-number') + 1);
    },

    goToPrev: function(){
      var _this = this;
      _this.state.transition( 'backward', _getCurrentPage().data('page-number') - 1);
    },

    goToPage: function(pageNum) {
      var _this = this;
      _this.state.transition( 'forward', pageNum);
    }

  };
};