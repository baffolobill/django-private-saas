jQuery.fn.price = function(opt){
    return this.each(function(){
	var $_ = this;
	var _params = null;
	var _option = {};

	_option = jQuery.extend(_option, opt);

	$_.hide_all_over = function(){
	    jQuery('.dropdown.price .dropdown-button.collapse-button').each(function(){
		$_.collapse(this);
	    });
	};

	$_.expand = function(el){
	    $_.hide_all_over();
	    jQuery(el).closest('.dropdown').find('.operations').removeClass('hidden');
	    jQuery(el).removeClass('expand-button').addClass('collapse-button');
	};

	$_.collapse = function(el){
	    jQuery(el).removeClass('collapse-button').addClass('expand-button');
	    jQuery(el).closest('.dropdown').find('.operations').addClass('hidden');
	};

	$_.bindEvents = function(){
	    jQuery('.dropdown.price .dropdown-button', $_).click(function(){
		if (jQuery(this).hasClass('expand-button'))
		    $_.expand(this);
		else
		    $_.collapse(this);

		return false;
	    });

	    jQuery('.dropdown.price .operations li.item', $_).hover(function(){
		jQuery(this).addClass('hover');
	    }, function(){
		jQuery(this).removeClass('hover');
	    });
	};	

	$_.init = function(){
	    try {
		$_.bindEvents();
	    } catch (err) {
		return false;
	    }
	};
	$_.init();
    });
}

/*
jQuery(document).ready(function(){
  jQuery('.dropdown.price .dropdown-button').click(function(){
    if (jQuery(this).hasClass('expand-button')) {
      jQuery(this).closest('.dropdown').find('.operations').removeClass('hidden');
      jQuery(this).removeClass('expand-button').addClass('collapse-button');
    } else {
      jQuery(this).removeClass('collapse-button').addClass('expand-button');
      jQuery(this).closest('.dropdown').find('.operations').addClass('hidden');
    }

    return false;
  });

  jQuery('.dropdown.price .operations li.item').hover(function(){
    jQuery(this).addClass('hover');
  }, function(){
    jQuery(this).removeClass('hover');
  });
});
*/