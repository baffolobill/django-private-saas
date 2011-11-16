/**
 * Get the current coordinates of the first element in the set of matched
 * elements, relative to the closest positioned ancestor element that
 * matches the selector.
 * @param {Object} selector
 */
jQuery.fn.positionAncestor = function(selector) {
    var left = 0;
    var top = 0;
    this.each(function(index, element) {
        // check if current element has an ancestor matching a selector
        // and that ancestor is positioned
        var $ancestor = jQuery(this).closest(selector);
        if ($ancestor.length && $ancestor.css("position") !== "static") {
            var $child = jQuery(this);
            var childMarginEdgeLeft = $child.offset().left - parseInt($child.css("marginLeft"), 10);
            var childMarginEdgeTop = $child.offset().top - parseInt($child.css("marginTop"), 10);
            var ancestorPaddingEdgeLeft = $ancestor.offset().left + parseInt($ancestor.css("borderLeftWidth"), 10);
            var ancestorPaddingEdgeTop = $ancestor.offset().top + parseInt($ancestor.css("borderTopWidth"), 10);
            left = childMarginEdgeLeft - ancestorPaddingEdgeLeft;
            top = childMarginEdgeTop - ancestorPaddingEdgeTop;
            // we have found the ancestor and computed the position
            // stop iterating
            return false;
        }
    });
    return {
        left:    left,
        top:    top
    }
};

jQuery.fn.model3dInfoPanel = function(opt){
    return this.each(function(){
	var $_ = this;
	var _option = {
	    width: 'full',  // 'full', 'fixed'
	    container: '',  // selector
	    content: '', // selector
	    scroller: false, // true or false
	    beforeDraw: '',  // function
	    ajax: false,  // bool - if true - you must see to it that content was copied to container, before it will displayed; if false - content will be copied from <content> block
	    afterClick: '',  // function
	    copy_to: '.content',  // selector
	    offsetRelativeParent: '#main>.main',  // selector - if specified, offset is calculated relative specified parent
	    parent: '.model3d',  // selector
	};
	_option = jQuery.extend(_option, opt);
	var _parent = jQuery($_).closest(_option.parent);

	$_.getOffsetPosition = function(){
	    if (_option.offsetRelativeParent.length == 0) {
		var _offset = jQuery($_).position();
		var _parent_offset = _parent.position();
	    } else {
		var _offset = jQuery($_).positionAncestor(_option.offsetRelativeParent);
		var _parent_offset = _parent.positionAncestor(_option.offsetRelativeParent);
	    }
	    
	    var _offset_left = _offset.left;
	    var _offset_top = _offset.top -2;
//	    if (_option.width == 'full') {
//		_offset_left += parseInt(_offset.left);
//		_offset_top += parseInt(_offset.top) -2;
//	    } else if (_option.width == 'fixed') {
//		_offset_left = parseInt(_parent_offset.left) + parseInt(jQuery($_).position().left);
//		_offset_top += parseInt(_offset.top) -2;
//	    }


	    return {left:_offset_left, top:_offset_top,
		    parent:{left:_parent_offset.left, top:_parent_offset.top}};
	};

	$_.draw = function(){
	    var _offset = $_.getOffsetPosition();
//	    alert('left: '+_offset.left+"\ntop: "+_offset.top);
	    if (!_option.ajax) {
		var _data = jQuery(_parent).find(_option.content).clone();
		var _content = jQuery(_option.copy_to, _option.container).html(_data.html());
	    } else {
		var _content = jQuery(_option.copy_to, _option.container);
	    }

	    if (_option.width == 'full') {
		jQuery(_option.container).css({top:_offset.top}).show()
		    .find('.label').css({left:_offset.left});
	    } else if (_option.width == 'fixed') {
		var padding = parseInt(jQuery('.main > .mid', _parent).css('padding-right'));

		var label_padding = parseInt(jQuery($_).css('padding-left'));
		var label_width = parseInt(jQuery($_).outerWidth(true));
		var label_offset_right = 5;

		jQuery(_option.container).css({top:_offset.top}).show();

		var content_padding = parseInt(jQuery(_option.container).find('.shadow-right')
					       .css('padding-right')) + 
		    parseInt(jQuery(_option.container).find('.wrapper').css('padding-right'));

		var container_width = parseInt(_content.find(':nth-child(1)').outerWidth(true))
		    + content_padding * 2;
		var container_left = _offset.left + label_width - container_width
		    + label_offset_right + label_padding;

		if (container_left <= 0) {
		    container_left = _offset.parent.left;
		}

		var label_left = _offset.left - container_left - label_offset_right;

		jQuery('.label', _option.container).css({left: label_left});
		
		jQuery(_option.container).css({width: container_width,
					       left: container_left});

	    }
	};

	$_.bindEvents = function(){
	    jQuery($_).click(function(){
		if (typeof _option.beforeDraw == 'function')
		    _option.beforeDraw(_parent);

		$_.draw();

		if (typeof _option.afterClick == 'function')
		    _option.afterClick(_parent);

		return false;
	    });
	    jQuery(_option.container).find('.label').click(function(){
		jQuery(_option.container).hide();

		jQuery(_option.copy_to, _option.container).empty();

		return false;
	    });
	    jQuery(_option.container).click(function(){
		return false;
	    });
	    jQuery(window).click(function(){
		jQuery(_option.container).find('.label').trigger('click');
	    });
	};

	$_.init = function(){
	    $_.bindEvents();
	};

	$_.init();
    });
}

function blockModels3dBlock(){
    block('#models3d-block');

}
function unblockModels3dBlock(){
    unblock('#models3d-block');
}
