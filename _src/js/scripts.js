blProto = {

	self: this,
	
	constants: {
		FIRST_THING: 20,
		SECOND_THING: 230
	},

	init: function(){
		this.flyOuts();
		this.events();
	},

	events: function(){
		// $('#mainNav').draggable({axis: 'x', containment: "#nav > .row"});

		$('.hamburglar').click(function(event) {
			$('#nav').toggleClass('is-active');
		});
	},

	flyOuts: function(){
		$('#mainNav .nav-item').hover(function() {
			$('#globalFlyouts .subnav').removeClass('flyout-on');
			$( $('#globalFlyouts .subnav')[ $('#mainNav .nav-item').index($(this)) ]).addClass('flyout-on');
		}, function() {
			$('#globalFlyouts .subnav').removeClass('flyout-on');
		});
	},

	secondThing: function(){
		
	}

}.init();
