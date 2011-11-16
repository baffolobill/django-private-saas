/*************************************/
// Dependences:
// - jquery.mousewheel
//
//
/************************************/

jQuery.fn.contentScroller = function(opt){
    return this.each(function(){
	var $_ = this;
	var _err = 0;
	var _params = null;
	var _is_loaded = false;
	var _is_scrolling = false;
	var _is_hidden = false;
	var _option = {
	    scrollbar: '.scrollbar',  // selector
	    wrapper: '.scroll-wrapper',  // selector
	    content: '.scroll-content', // selector
	    height: '300px', // (in pixels) - height of visible area
	    overflow: 'hidden' // (hidden|visible) - is scroll-content may be cropped
	};
	var _constant_option = {
	    content_height: 0,
	    scrollPane: null,  // handler
	    last_item: null,  // handler
	    scrollContent: null,  // handler
	    visible_lines: 0,
	    line_height: 0
	};
	_option = jQuery.extend(_option, opt);
	_option.height = parseInt(_option.height);

	$_.getParams = function(refreshParams){
	    if (refreshParams == undefined)
		refreshParams = true;

	    var _scrollPane_height = _constant_option.scrollPane.height();
	    var _offset = _constant_option.scrollPane.offset();
	    if (_constant_option.content_height == 0 || refreshParams) {
		_constant_option.content_height = _constant_option.last_item.offset().top +
		    _constant_option.last_item.outerHeight() - _offset.top;
	    }
	    var _content_height = _constant_option.content_height;

	    var _scroller_height = _scrollPane_height * _scrollPane_height / _content_height;
	    if (_scroller_height < 30) {
		_scroller_height = 30;
	    } else if (_scroller_height >= _scrollPane_height && _scrollPane_height > _content_height) {
		_scroller_height = _scrollPane_height;
	    }

	    //console.log('scroll_pane_height: '+_scrollPane_height + '; option.height: '+_option.height);
	    if (_content_height <= _option.height)
		$_.hideScrollbar();

	    return {scrollPane_height: _scrollPane_height,
		    content_height: _content_height,
		    scroller_height: _scroller_height,
		    offset: _offset};
	};

	$_.hideScrollbar = function(){
	    //console.log('hidden');
	    _is_hidden = true;
	    jQuery(_option.scrollbar, $_).css({display:'none'});
	};

	$_.draw = function(top_pos){
	    if (_option.overflow=='visible') {
		
		var _lt = Math.abs(Math.round(top_pos/_constant_option.line_height));
		var _gt = _lt+_constant_option.visible_lines;
		//console.log('lt: '+_lt+'; gt: '+_gt);

		jQuery(_option.content, $_).children(':lt('+_lt+')').hide();

		var filter = ':gt('+(_lt-1)+')';
		if (_lt == 0)
		    filter = ':eq(0), :gt('+_lt+')';
		jQuery(_option.content, $_).children(filter).show();
		

		jQuery(_option.content, $_).children(':gt('+(_gt-1)+')').hide();
	    } else {
		jQuery(_option.content, $_).css({top:top_pos});
	    }
	};

	$_.resize = function(isFirstLaunch){
	    if (isFirstLaunch == undefined)
		isFirstLaunch = false;

	    _params = $_.getParams(isFirstLaunch);
//	    if (isFirstLaunch)
//		alert('pane: '+_params.scrollPane_width+"\ncontent: "+_params.content_width);
	    _scroller = jQuery(_option.scrollbar+' > .scroller', $_);

	    _scroller.css({height:_params.scroller_height});
	    
	    if (!isFirstLaunch) {
		var _current_pos = parseInt(_scroller.css('top'));
		if ((_current_pos + _params.scroller_height) >= _params.scrollPane_height)
		    _current_pos = _params.scrollPane_height - _params.scroller_height;
	    } else {
		var _current_pos = 0;
	    }

	    var _top_pos = 0;
	    if (!isFirstLaunch) {
		var _top_pos = _current_pos * (_params.scrollPane_height - _params.content_height) / 
		    (_params.scrollPane_height - _params.scroller_height);
	    }

	    _scroller.css({top:_current_pos});
	    //jQuery(_option.content, $_).css({top:_top_pos});
	    $_.draw(_top_pos);
	};

	$_.bindEvents = function(){
	    jQuery(_option.scrollbar+' > .scroller', $_).mouseenter(function(){
		if (!_is_scrolling){
		    jQuery(this).css({'width':'10px','right':'-2px','z-index':51});
		}
	    }).mouseleave(function(){
		if (_is_scrolling == false){
		    jQuery(this).css({'width':'6px','right':'0px'});
		}
            });
	    jQuery(_option.scrollbar+' > .scroller', $_).draggable({
		containment:'parent',
		axis:'y',
		start: function(event, ui){ 
		    jQuery(this).css({'width':'10px','right':'-2px','z-index':51});
		    _is_scrolling = true;
		},
		stop: function(event, ui){
		    jQuery(this).css({'width':'6px','right':'0px'});
		    _is_scrolling = false;
		},
		drag: function(event, ui){
		    var _top_pos = ui.position.top * (_params.scrollPane_height - _params.content_height) /
			(_params.scrollPane_height - _params.scroller_height);
		    $_.draw(_top_pos);
		    //jQuery(_option.content, $_).css({top:_top_pos});
		}
	    });
	    jQuery(_option.scrollbar+' > .scroll-bg', $_).mouseup(function(e){
		var _new_pos = e.pageY - _params.offset.top;
		if (_new_pos < 0) {
		    _new_pos = 0;
		} else if (_new_pos <= (_params.scroller_height / 2)) {
		    _new_pos = 0;
		} else if (_params.scrollPane_height <= (_new_pos + (_params.scroller_height / 2))) {
		    _new_pos = _params.scrollPane_height - _params.scroller_height;
		} else {
		    _new_pos = _new_pos - _params.scroller_height / 2;
		}

		jQuery(_option.scrollbar+' > .scroller', $_).css({top:_new_pos});

		var _top_pos = (_params.scrollPane_height - _params.content_height) /
		    (_params.scrollPane_height - _params.scroller_height) * _new_pos;
		$_.draw(_top_pos);

		//jQuery(_option.content, $_).css({top:_top_pos});
	    });
	    /*jQuery($_).click(function(){
		return false;
	    });*/
	    jQuery('.scroll-pane', $_).mousewheel(function(event, delta, deltaX, deltaY){
		var _scroller = jQuery(_option.scrollbar+' > .scroller', $_);
		var _new_pos = _scroller.position().top - delta;
		
		//console.log(_new_pos);
		
		if (_new_pos < 0) {
		    _new_pos = 0;
		} else if (_new_pos>(_option.height-_params.scroller_height)) {
		    //_new_pos = _option.height - _params.scroller_height;
		    _new_pos = _option.height - _params.scroller_height + 1; // fix0 (add 1 to new pos)
		}

		_scroller.css({top:_new_pos});

		var _top_pos = (_params.scrollPane_height - _params.content_height) /
		    (_params.scrollPane_height - _params.scroller_height) * _new_pos;
		$_.draw(_top_pos);
		event.stopPropagation();
		event.preventDefault();
	    });
	};

	$_.init = function(){
	    _constant_option.scrollPane = jQuery('.scroll-pane', $_);
	    _constant_option.scrollContent = jQuery('.scroll-pane > :nth-child(1)', $_);
	    _constant_option.scrollContent.addClass('scroll-content');
	    _constant_option.last_item = jQuery('.scroll-content > .last', _constant_option.scrollPane);

	    // set scroll-pane height
	    //_constant_option.scrollPane.css({height:_option.height, overflow:'hidden'});
	    _constant_option.scrollPane.css({height:_option.height, overflow:_option.overflow});

	    // set height of scrollbar
	    jQuery(_option.scrollbar, $_).css({height:_option.height}).show();

	    // calculate line height 
	    if (_option.overflow == 'visible') {
		_constant_option.line_height = parseInt(_constant_option.last_item.outerHeight());
		_constant_option.visible_lines = Math.floor(_option.height/_constant_option.line_height);
	    }

	    try {
		$_.resize(true);
		// if nothing to scroll just do same thing - nothing
		if (!_is_hidden) 
		    $_.bindEvents();
	    } catch (err) {
		//console.log(err);
		_err = 1;
		return false;
	    }

//	    if (!_is_loaded)
//		$_.resize(true);
	};
	$_.init();
    });
}
