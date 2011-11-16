jQuery.fn.catalogMenu = function(opt){
    return this.each(function(){
		var $_ = this;
		_is_timer_active = false;
		_timeout = null;
		_is_outside = true;
		_is_timer2_active = false;

		var root = jQuery(this);
		var cookie = '_COOKIE_SIMPLE_TREE';
		var simpleTree = null;
		
		var $_option = {
		    url: '',  // string
		    cookie_prefix: '', // string
		    error: '',  // selector
		    output: 'div#models3d-block',  // selector
		    is_redirect: false
		};
		$_option = jQuery.extend($_option, opt);
		
		$_.setHeight = function(){
			var _window_height = jQuery(window).height();
			//console.log('window height = '+_window_height);

			var _offset_top = jQuery('#bodyMenu').offset().top;
			//console.log('offset top = '+_offset_top);

			var _height = _window_height - _offset_top;
			//console.log('height = '+_height);

			jQuery('#bodyMenu').css({'height':_height});
		};
		$_.hide_scroll = function(){
			if (_is_outside){
				if (!_is_timer_active){
					if (jQuery('#bodyMenu .jspTrack .jspActive').length){
						setTimeout($_.hide_scroll, 1000);
						_is_timer2_active = true;
					} else {
						jQuery('#bodyMenu').removeClass('active');
					}
				}
			}
			_is_timer2_active = false;
		};

		$_.process_click = function(el){
			// hide model3d info blocks
			//jQuery('#images-preview-block').hide();
			//jQuery('#download-block').hide();

			//jQuery('#search-panel').removeClass('current-mode');
			//jQuery('#bodyMenu').addClass('current-mode');

			var cid = jQuery(el).attr('id');
			if (jQuery(el).children('ul').length > 0) return;

			jQuery.cookie(cookie, cid, {path:'/', expires:10});


			if ($_option.is_redirect) {
				var _url = setURLHashForURL($_option.url, cid);
				writeURLToCookie(_url);
				window.location.href = $_option.url + cid + '/';
			} else {
				// add selected category id to url hash
				setURLHash($_option.url + cid + '/');//cid);
				writeCurrentURLToCookie();
			}

			processLoadPage($_option.url + cid + '/', 
							function(){
							    if (!jQuery('#models3d-block').is(':visible')){
							      m3dPage.back();
							    }				    					
							}, 
							function(){
					    		jQuery('.simpleTree .current').removeClass('current');
					    		jQuery(el).addClass('current');	    					
							});
		};

		$_.init = function(){
			var self = $_;
			$_.setHeight();

			jQuery(window).resize($_.setHeight);

			jQuery('#bodyMenu').hover(function(){
				jQuery(this).addClass('hover');

				if (_is_timer_active){ 
					clearTimeout(_timeout);
					_is_timer_active = false;
				}
				jQuery(this).addClass('active');
				_is_outside = false;
			},function(){
				jQuery(this).removeClass('hover');
				_is_outside = true;
				if (!_is_timer_active && !jQuery('#bodyMenu .jspTrack .jspActive').length){
					_timeout = setTimeout(function(){ jQuery('#bodyMenu').removeClass('active'); _is_timer_active = false; }, 1000);
					_is_timer_active = true;
				} else if(!_is_timer2_active){
					setTimeout($_.hide_scroll, 1000);
				}
			
			});

		    cookie = $_option.cookie_prefix.toUpperCase() + cookie;
		    simpleTree = jQuery($_).simpleTree({
				autoclose: true,
				animate: true,
				cookie: cookie,
				afterClick: function(el){
					self.process_click(el);
				}
			});
		};

		$_.init();
    });
}
