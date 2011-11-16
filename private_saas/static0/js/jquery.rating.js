// jQuery rating plugin
// author: baffolobill[at]yandex[dot]ru
// specially for baffolobill.com

(function($) {
    $.fn.rating = function(settings) {
	var config = {'range': 5, // rating range (5 - means user can rate item from 1 to 5
		      'rating': 0,
		      'showTips': true,
		      'callback': null,
		      'focus': null,
		      'blur': null,
		      'tips': ['','Very poor','Poor','Ok','Good','Very good']};
 
	if (settings) $.extend(config, settings);

	var sysconfig = {'selected':0, 'tips_':null};

	this.each(function() {
	    var $_ = $(this);
	    
	    if (config.rating > 0)
		$('.star:nth-child('+config.rating+')', $_).prevAll().andSelf().addClass('star-active');

	    if (config.showTips && $.isArray(config.tips) && 
		config.tips.length > config.range)
	    {
		$_.append('<span class="tip">'+config.tips[0]+'</span>');
		sysconfig.tips_ = $('.tip', $_);
	    } else {
		config.showTips = false;
	    }


	    $('.star', $_).css({'cursor':'pointer'}).click(function(){
		$('.star-active', $_).removeClass('star-active');
		$(this).prevAll().andSelf().addClass('star-active');
		
		var _count = $(this).prevAll().andSelf().length;
		console.log('stars: '+_count);
		sysconfig.selected = _count;

		if (typeof(config.callback) == 'function')
		    config.callback(_count, this, $_);
	    }).hover(function(){
		$('.star-active', $_).removeClass('star-active');
		$('.star-hover', $_).removeClass('star-hover');
		$(this).prevAll().andSelf().addClass('star-hover');

		var _selected = $(this).prevAll().andSelf().length;

		if (config.showTips && sysconfig.tips_!=null)
		    sysconfig.tips_.html(config.tips[_selected]);

		if (typeof(config.focus) == 'function')
		    config.focus(_selected, this);
	    }, function(){
		$('.star-hover', $_).removeClass('star-hover');
		$('.star:nth-child('+sysconfig.selected+')', $_).prevAll().andSelf().addClass('star-active');

//		if (config.showTips && sysconfig.tips_!=null)
//		    sysconfig.tips_.html(config.tips[sysconfig.selected]);

		if (typeof(config.blur) == 'function')
		    config.blur($(this).prevAll().andSelf().length, this);
	    });
	});
	
	return this;
    };
})(jQuery);