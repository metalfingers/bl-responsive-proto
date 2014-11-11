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
          tallest = el.height() > tallest ? el.height() : tallest;
          widest = el.width() > widest ? el.width() : widest;
        });

        return {
          height: tallest,
          width: widest
        };
      },

      _setCurrentPage = function(pageNum){

        pageNum = pageNum === (undefined || -1) ?  1 : pageNum; // set 1 as the default

        // set current-page class on lookbook pages
        $.each($cache.pages, function(index, el) {
          el.removeClass('current-page');
        });

        $($cache.pages) // use jQuery's .filter method because IE8 Arrays don't have filter built in
          .filter(function(index) {
            return $(this).data('page-number') === pageNum;
          })[0]
          .addClass('current-page');

        // set current-page class on pagination items
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

      _keepInBounds = function(direction, transitionFunction, slideNumber) {
        // check to see if slideNumber is greater than the length of the 
        // lookbook or less than the first page in the lookbook
        if (slideNumber > $cache.pages.length ||
              slideNumber < options.startPage) { 
          
          if (direction === 'backward') {
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
      // activate the lookbook. If we're past the breakpoint, return
      if ($(window).width() < options.breakPoint) {
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
      _this.state.transition( 'forward', 1);
      _this.state.isActive = true;

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

      // startPage: defines the first slide in the lookbook
      // input: int
      // options: 1[default]...whatever 
      startPage: function(){
        options.startPage = options.startPage ? options.startPage : 1;
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
            _this.state.transition = function(direction, destination) { _keepInBounds(direction, _transitionFade, destination); };
            break;
          case "skip":
            // stuff
            _transitionSkip();
            break;
          case "cards":
            // stuff
            // $lookbook.find('.lookbook-page:not(.lookbook-page .lookbook-page)').css('opacity', 0);
            _this.state.transition = function(direction, destination) { _keepInBounds(direction, _transitionCards, destination); };
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