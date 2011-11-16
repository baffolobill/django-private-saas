jQuery.fn.concealedBlock = function(opt){
    return this.each(function(){
	$_ = this;
	_option = {
	    hideButton: '',  // selector
	    showButton: '',  // selector
	    container: '',  // selector of a block which will be concealed
	    cookie: '',  // string
	    beforeHide: '',  // function
	    beforeShow: '',  // function
	    raiseEvent: '',  // string - if not empty, raise specified event
	    animateHide: {options:{height:'hide'}, duration:'fast', effect:'linear', callback:null, is_using:false},
	    animateShow: {options:{height:'show'}, duration:'fast', effect:'linear', callback:null, is_using:false}
	};
	opt.animateHide = jQuery.extend(_option.animateHide, opt.animateHide);
	opt.animateShow = jQuery.extend(_option.animateShow, opt.animateShow);
	_option = jQuery.extend(_option, opt);

	$_.bindEvents = function(){
	    // hide block
	    jQuery(_option.hideButton).click(function(){
		if (typeof _option.beforeHide == 'function') {
		    _option.beforeHide();
		}

		jQuery(_option.hideButton).hide();
		if (_option.animateHide.is_using) {
		    if (typeof(_option.animateHide.callback) != 'function')
			_option.animateHide.callback = function(){
			    jQuery(_option.showButton).show();
			};

		    jQuery(_option.container).animate(_option.animateHide.options,
						      _option.animateHide.duration,
						      _option.animateHide.effect,
						      _option.animateHide.callback);
		} else {
		    jQuery(_option.showButton).show();
		    jQuery(_option.container).hide();
		}
		
		if (_option.cookie.length > 0) {
		    jQuery.cookie(_option.cookie, 'hidden', {path:'/', expires:10});
		}
		
		if (_option.raiseEvent.length > 0) {
		    jQuery(document).triggerHandler(_option.raiseEvent);
		}

		return false;
	    });

	    // show block
	    jQuery(_option.showButton).click(function(){
		if (typeof _option.beforeShow == 'function') {
		    _option.beforeShow();
		}

		jQuery(_option.showButton).hide();
		if (_option.animateShow.is_using) {
		    if (typeof(_option.animateShow.callback) != 'function')
			_option.animateShow.callback = function(){
			    jQuery(_option.hideButton).show();
			};

		    jQuery(_option.container).animate(_option.animateShow.options,
						      _option.animateShow.duration,
						      _option.animateShow.effect,
						      _option.animateShow.callback);
		} else {
		    jQuery(_option.container).show();
		    jQuery(_option.hideButton).show();
		}

		if (_option.cookie.length > 0) {
		    jQuery.cookie(_option.cookie, 'showed', {path:'/', expires:10});
		}

		if (_option.raiseEvent.length > 0) {
		    jQuery(document).triggerHandler(_option.raiseEvent);
		}

		return false;
	    });
	};

	$_.init = function(){
	    $_.bindEvents();
	    if (_option.cookie.length > 0) {
		var _state = jQuery.cookie(_option.cookie);
		if (_state == 'hidden') {
		    jQuery(_option.hideButton).trigger('click');
		}
	    }
	};
	$_.init();
    });
}