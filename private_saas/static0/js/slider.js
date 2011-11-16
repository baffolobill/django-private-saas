/*************************************/
// Dependences:
// 
//
//
/************************************/

;(function($){
	$.fn.contentSlider = function(opts){
		var defaultSettings = {
		    'itemClass': 'div.model3d'
		};
		settings = $.extend(defaultSettings, opts);
		
		var root = this;
		this.each(function(){
			var cs = new ContentSliderObject(this, settings);

			cs.init();	
		});
		
    }
    function ContentSliderObject(root, settings){
		this.root = root;
		this.settings = settings;
		
		this.scrollPane = null;
		this.scrollContent = null;
		this.scrollbar = null;
		this.handleHelper = null;
		this.is_timer_active = false;
		this.timeout = null;
		this.button_pressed = false;
		
		this.debug_mode = false;
    }

    ContentSliderObject.prototype = {
	    debug: function(msg){
			if (this.debug_mode){
			    console.log('contentSlider: '+msg);
			}
	    },
	    init: function(){
			var self = this;
			
			if (this.scrollPane == null){
			    this.debug('scrollPane init');
			    this.scrollPane = $('.scroll-pane', this.root);
			}
			if (this.scrollContent == null){
			    this.debug('scrollContent init');
			    this.scrollContent = $('.scroll-content', this.scrollPane);
			    //var l = this.scrollContent.find(this.settings.itemClass).last();
			    var w = 3;//l.offset().left + l.width();
			    this.scrollContent.find(this.settings.itemClass).each(function(index){
				    w += $(this).outerWidth(true);
				});
			    this.scrollContent.css('width', w);
			    this.debug('scrollContent.width == '+w);
			}
			if (this.scrollbar == null){
			    this.debug('scrollbar init');
			    this.scrollbar = $('.scroll-bar', this.scrollPane).slider({
			    	start: function(){ self.button_pressed = true; },
			    	stop: function(){ 
				    	self.button_pressed = false; 
				    	if (!self.is_timer_active){
							self.timeout = setTimeout(function(){ $(self.root).removeClass('active'); self.is_timer_active = false; }, 1000);
							self.is_timer_active = true;
						}
				    },
				    slide: function(event, ui){
						var marginLeft = 0;
						var scWidth = self.scrollContent.width();
						var spWidth = self.scrollPane.width();

						if (scWidth > spWidth){
						    marginLeft = Math.ceil(ui.value/100*(spWidth-scWidth))+'px';
						}
						self.scrollContent.css('margin-left', marginLeft);
						/*if (self.scrollContent.width() > self.scrollPane.width()){
							self.scrollContent.css( "margin-left", Math.round(
								ui.value / 100 * (self.scrollPane.width() - self.scrollContent.width())
							) + "px" );
						} else {
							self.scrollContent.css( "margin-left", 0 );
						}*/
				    }
				});
			}
			if (this.handleHelper == null){
			    this.debug('handleHelper init');
			    this.handleHelper = this.scrollbar.find('.ui-slider-handle')
			    .mousedown(function(){
				    self.scrollbar.width(self.handleHelper.width());
				})
			    .mouseup(function(){
				    self.scrollbar.width('100%');
				})
				//.append( "<span class='ui-icon ui-icon-grip-dotted-vertical'></span>" )
			    .wrap('<div class="ui-handle-helper-parent"></div>').parent();
			}
			this.scrollPane.css('overflow', 'hidden');
			this.bind();

			return true;
	    },

	    //size scrollbar and handle proportionally to scroll distance
		sizeScrollbar: function(self){
			if (typeof(self) == 'undefined'){
			    self = this;
			}
	        
			var scWidth = self.scrollContent.width();
			var spWidth = self.scrollPane.width();
			var remainder = scWidth - spWidth;
			var proportion = remainder / scWidth;
			var handleSize = spWidth - (proportion * spWidth);
			self.scrollbar.find('.ui-slider-handle').css({
				'width': handleSize,
				'margin-left': -handleSize/2
			});
			self.handleHelper.width('').width(self.scrollbar.width() - handleSize);
	    },
        
	    //reset slider value based on scroll content position
	    resetValue: function(self){
			if (typeof(self) == 'undefined'){
			    self = this;
			}
	            
			var remainder = self.scrollPane.width() - self.scrollContent.width();
			var leftVal = self.scrollContent.css('margin-left') === 'auto' ? 0 :
	                                         parseInt(self.scrollContent.css('margin-left'));
			var percentage = Math.round(leftVal / remainder * 100);
			self.scrollbar.slider('value', percentage);
	    },
        
	    //if the slider is 100% and window gets larger, reveal content
	    reflowContent: function(self){
			if (typeof(self) == 'undefined'){
			    self = this;
			}
			var showing = self.scrollContent.width() + 
	                    parseInt(self.scrollContent.css('margin-left'), 10);
			var gap = self.scrollPane.width() - showing;
			if (gap > 0){
			    self.scrollContent.css('margin-left', 
						   parseInt(self.scrollContent.css('margin-left'), 10) + gap);
			}
	    },
	    bind: function(){
			var self = this;
			//change handle position on window resize
			$(window).resize(function(){
				self.resetValue(self);
				self.sizeScrollbar(self);
				self.reflowContent(self);
			});

			$(self.root).hover(function(){
				if (self.is_timer_active){ 
					clearTimeout(self.timeout);
					self.is_timer_active = false;
				}
				$(this).addClass('active');
			},function(){
				if (!self.is_timer_active && !self.button_pressed){
					self.timeout = setTimeout(function(){ $(self.root).removeClass('active'); self.is_timer_active = false; }, 1000);
					self.is_timer_active = true;
				}
			});


	            
			//init scrollbar size
			//safari wants a timeout
			setTimeout(function(){self.sizeScrollbar(self); }, 10);
	    }
    }
})(jQuery);
