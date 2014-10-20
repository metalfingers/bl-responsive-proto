var blProto = {

	self: this,
	
	constants: {
		FIRST_THING: 20,
		SECOND_THING: 230
	},

	init: function(){
		this.flyOuts();
		this.events();
		this.lookbooks();
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

	lookbooks: function(){
		var testLookBook = new BloomiesLookbook($('.lookbook-wrapper'), {breakPoint: 640});
		testLookBook.activate();
	}

};


$( window ).load(function(){
	blProto.init();
});