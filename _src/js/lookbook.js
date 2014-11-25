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
        // if we're going to where we already are, just return
        if (_getCurrentPage().data('page-number') === slideNumber) {
          return;
        }

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

      _transitionScroll = function(direction, toPage){
        var $newPage = $($cache.pages) 
                        .filter(function(index) {
                          return $(this).data('page-number') === toPage;
                        })[0];
        $('body, html').animate({scrollTop: $newPage.offset().top}, 500);
        _setCurrentPage(toPage);
      },

      _transitionSkip = function(direction, toPage){

      },

      _transitionSlide = function(direction, toPage){
        var offset = 0;

        // get the offset that we're going to be sliding to
        $.each($cache.pages, function(index, val) {
          if ($(val).data('page-number') < toPage) {
            offset += $(val).width();
          }
        });
        _setCurrentPage(toPage);
        $cache.lookbook
          .children('.lookbook-page-wrapper')
          .children('.slide-wrapper')
          .css({
            'transform': 'translateX(-' + offset + 'px)',
            '-webkit-transform': 'translateX(-' + offset + 'px)'
          });
      },

      _transitionStack = function(direction, toPage){
        if (_getCurrentPage().data('page-number') <= toPage) {
          // note!!! step through each slide between current and destination
          // add the transition-stack-above class
          _setCurrentPage(toPage).addClass('transition-stack-above');
        } else {
          // note!!! step through each slide between current and destination
          // remove the transition-stack-above class
          _getCurrentPage().removeClass('transition-stack-above');
          _setCurrentPage(toPage);
        }
      };


  return {
    state: {
      cache: $cache,
      handlersSet: false,
      introPageDisplayed: false,
      isActive: false,
      nameSpace: null,
      optionsSet: false,
      transition: function(arg){ 
        _transitionSlide(arg); 
      },
      transitionDirection: 'horizontal',
      transitionStyle: 'slide'
    },

    activate: function(){
      var _this = this;

      // first things first. if we're in IE8, just quit!
      if ($('html.lt-ie9').length > 0) {
        return;
      }

      // second thing second. namespace the thing (unless it already has one)!
      if (_this.state.nameSpace === null) {
        _this.state.nameSpace = 'lookBook' + Date.now();
      }

      // cache the lookbook pieces first! (if they haven't already been cached)
      if ($.isEmptyObject($cache)) {
        _cacheLookBook();
      }

      // run through the options at least once
      if (!_this.state.optionsSet) {
        // loop through all options and run them...
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
        _this.goToPage(options.introPage);
      } else {
        _this.goToPage(1);
      }

      _this.state.isActive = true;

    },

    kill: function(){
      var _this = this;

      $lookbook
        .removeClass('is-active')
        .addClass('is-deactivated')
        .css('height', '');

      $lookbook.find('.lookbook-page, .slide-wrapper')
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

      // stickyNav: ...adds a sticky class to the nav
      // input: boolean / string
      // options: boolean true or a jquery object or a class name 
      stickyNav: function(){
        if (typeof options.stickyNav === 'boolean') {
          $cache.lookbook
            .children('.lookbook-pagination')
            .waypoint('sticky', { stuckClass: 'lookbook-sticky' });
        } else if (options.stickyNav instanceof jQuery) {
          options.stickyNav.waypoint('sticky', { stuckClass: 'lookbook-sticky' });
        } else if (typeof options.stickyNav === 'string') {
          $( options.stickyNav ).waypoint('sticky', { stuckClass: 'lookbook-sticky' });
        }
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
        var _this = this;
        if (options.transitionDirection !== undefined) {
          $cache.lookbook
            .addClass('transition-direction-' + options.transitionDirection);
          _this.state.transitionDirection = options.transitionDirection;
        } else {
           $cache.lookbook
            .addClass('transition-direction-horizontal');
        }
      },

      // transitionStyle: defines the transition between slides
      // input: string
      // options: "slide" [default], "fade", "skip", "stack", "pageScroll" 
      transitionStyle: function(){
        var _this = this;

        if (options.transitionStyle !== undefined) {
          _this.state.transitionStyle = options.transitionStyle;
        }

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

          case "pageScroll":
            $.each($cache.pages, function(index, val) {
               $(val).addClass('transition-page-scroll');
            });
            $cache.lookbook
              .children('.lookbook-page-wrapper')
              .addClass('page-scroll');
            _this.state.transition = function(direction, destination) { 
              $(window).trigger('pageChangeStart.' + _this.state.nameSpace);
              _keepInBounds(direction, _transitionScroll, destination); 
              $(window).trigger('pageChangeEnd.' + _this.state.nameSpace); 
            };
            break;

          case "skip":
            // stuff
            _transitionSkip();
            break;

          case "stack":
            // stuff
            $.each($cache.pages, function(index, val) {
               $(val).addClass('transition-stack');
            });
            _this.state.transition = function(direction, destination) { 
              $(window).trigger('pageChangeStart.' + _this.state.nameSpace);
              _keepInBounds(direction, _transitionStack, destination); 
              $(window).trigger('pageChangeEnd.' + _this.state.nameSpace); 
            };
            break;

          default:
            // 'slide' is the default
            
            // add a wrapper around the pages and make it wide enough to fit
            // all pages
            $cache.lookbook
              .children('.lookbook-page-wrapper')
              .wrapInner('<div class="slide-wrapper"></div>');
            $cache.lookbook
              .children('.lookbook-page-wrapper')
              .children('.slide-wrapper')
              .css('width', function(){
                var ret = 0;
                $.each($cache.pages, function(index, val) {
                  ret += $(val).width();
                });
                return ret * 2 ; //return double for some padding
              });

            $.each($cache.pages, function(index, val) {
               $(val).addClass('transition-slide');
            });
            _this.state.transition = function(direction, destination) { 
              $(window).trigger('pageChangeStart.' + _this.state.nameSpace);
              _keepInBounds(direction, _transitionSlide, destination); 
              $(window).trigger('pageChangeEnd.' + _this.state.nameSpace); 
            };
        }
      }

    },

    setEventHandlers: function(){
      var _this = this,
          touching = false,
          startingPosition = null;

      if (_this.state.handlersSet === true) {
        return;
      }

      $cache.nav.nextBtn.on('click touchstart', function(event) {
        _this.goToNext();
      });

      $cache.nav.prevBtn.on('click touchstart', function(event) {
        _this.goToPrev();
      });

      $.each($cache.pagination, function(index, val) {
          $(val).on('click touchstart', function(event) {
            _this.goToPage($(this).data('for-page-number'));
          });
       });

      // swiping
      $cache.lookbook.on('touchstart', function(event) {
        touching = true;
        startingPosition = {
          x: event.originalEvent.changedTouches[0].pageX,
          y: event.originalEvent.changedTouches[0].pageY
        };
        return false;
      });

      $cache.lookbook.on('touchend', function(event) {
        var touchThreshold = 80; // disregard moves within 80px of each other
        touching = false;
        // if we're in a horizontal orientation, check the x vals
        if (_this.state.transitionDirection === 'horizontal') {
          if (Math.abs( event.originalEvent.changedTouches[0].pageX - startingPosition.x ) > 
            touchThreshold ) {
            if (event.originalEvent.changedTouches[0].pageX > startingPosition.x) {
              _this.goToPrev();
            } else {
              _this.goToNext();
            }
          } else {
            //do nothing, we're not past the threshold
          }
        } else {
          if (Math.abs( event.originalEvent.changedTouches[0].pageY - startingPosition.y ) > 
            touchThreshold ) {
            if (event.originalEvent.changedTouches[0].pageY > startingPosition.y) {
              _this.goToPrev();
            } else {
              _this.goToNext();
            }
          } else {
            //do nothing, we're not past the threshold
          }          
        }

      });

      $cache.lookbook.on('touchmove mousemove', function(event){
        // might use this...
      });

      _this.state.handlersSet = true;
    },

    goToNext: function(direction, destination){
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